import { useMemo, useState } from 'react'
import { FilePlus2, Copy, CalendarClock, Check, ArrowLeft, ArrowRight, Plus, Trash2, Lock } from 'lucide-react'
import Modal from './Modal'
import {
  useStore, uid, addYear, fmtDate, elementsReprise, elementLabel, formesJuridiques, rolesMission, statutLabels,
  type Client, type MembreEquipe, type ModeCreation, type Mission,
} from '../store'
import { typesMission } from '../data/cabinet'
import { useUi, type WizardInit } from '../ui'

const modes: { id: ModeCreation; titre: string; texte: string; icon: typeof FilePlus2 }[] = [
  {
    id: 'vierge', titre: 'Mission vierge', icon: FilePlus2,
    texte: 'Nouveau dossier à partir de zéro : nouveau client ou premier exercice audité.',
  },
  {
    id: 'clone', titre: 'Cloner une mission', icon: Copy,
    texte: "Reprendre les paramètres, le programme et l'équipe d'une mission existante, pour un autre client ou une autre mission.",
  },
  {
    id: 'report', titre: "Reprise de l'arrêté N → N+1", icon: CalendarClock,
    texte: "Démarrer l'exercice suivant d'une mission clôturée : même client, soldes de clôture repris en à-nouveaux.",
  },
]

const etapes = ['Mode', 'Source', 'Client & mission', 'Équipe', 'Récapitulatif']

const clientVide = (): Client => ({
  id: uid(), raisonSociale: '', sigle: '', formeJuridique: 'SA', rccm: '', nif: '', siege: '', activite: '', dirigeant: '',
})

const anneeDefaut = new Date().getFullYear() - 1

export default function NewMissionWizard({ init }: { init: WizardInit }) {
  const { state, client: getClient, collaborateur, profil, grade, creerMission } = useStore()
  const { fermerWizard, toast, aller } = useUi()

  const [etape, setEtape] = useState(init.mode ? 1 : 0)
  const [mode, setMode] = useState<ModeCreation>(init.mode ?? 'vierge')
  const [sourceId, setSourceId] = useState<string | undefined>(init.sourceId)
  const [reprise, setReprise] = useState<string[]>(
    init.mode && init.mode !== 'vierge' ? elementsReprise[init.mode].filter((e) => e.defaut).map((e) => e.id) : [],
  )
  const [clientChoix, setClientChoix] = useState<string>('nouveau')
  const [client, setClient] = useState<Client>(clientVide)
  const [mission, setMission] = useState({
    type: typesMission[0],
    exercice: anneeDefaut,
    debut: `${anneeDefaut}-01-01`,
    fin: `${anneeDefaut}-12-31`,
    echeance: `${anneeDefaut + 1}-06-30`,
  })
  const [equipe, setEquipe] = useState<MembreEquipe[]>([{ collaborateurId: 'c-audit', role: 'Associé signataire' }])
  const [erreur, setErreur] = useState('')

  const sources = useMemo(
    () => (mode === 'report' ? state.missions.filter((m) => m.statut === 'cloturee') : state.missions),
    [mode, state.missions],
  )
  const source = state.missions.find((m) => m.id === sourceId)

  const choisirMode = (m: ModeCreation) => {
    setMode(m)
    setSourceId(undefined)
    setReprise(m === 'vierge' ? [] : elementsReprise[m].filter((e) => e.defaut).map((e) => e.id))
  }

  // Pré-remplit client / mission / équipe à partir de la mission source.
  const appliquerSource = (src: Mission) => {
    const srcClient = getClient(src.clientId)
    const typeRepris = reprise.includes('parametres') && typesMission.includes(src.type)
    if (mode === 'report') {
      if (srcClient) { setClient(srcClient); setClientChoix(srcClient.id) }
      setMission({
        type: typeRepris ? src.type : typesMission[0],
        exercice: src.exercice + 1,
        debut: addYear(src.debut),
        fin: addYear(src.fin),
        echeance: addYear(src.echeance),
      })
    } else {
      setMission((m) => ({
        ...m,
        type: typeRepris ? src.type : m.type,
      }))
    }
    if (reprise.includes('equipe')) setEquipe(src.equipe.filter((e) => collaborateur(e.collaborateurId)?.actif))
  }

  const suivant = () => {
    setErreur('')
    if (etape === 0) return setEtape(mode === 'vierge' ? 2 : 1)
    if (etape === 1) {
      if (!source) return setErreur('Sélectionnez la mission source.')
      if (mode === 'report' && source.suiteId) return setErreur('Une mission N+1 existe déjà pour cette mission.')
      appliquerSource(source)
      return setEtape(2)
    }
    if (etape === 2) {
      if (!client.raisonSociale.trim()) return setErreur('La raison sociale du client est obligatoire.')
      if (mission.fin <= mission.debut) return setErreur("La fin d'exercice doit être postérieure au début.")
      return setEtape(3)
    }
    if (etape === 3) {
      if (equipe.length === 0) return setErreur('Affectez au moins un collaborateur à la mission.')
      return setEtape(4)
    }
  }

  const precedent = () => { setErreur(''); setEtape(etape === 2 && mode === 'vierge' ? 0 : etape - 1) }

  const creer = () => {
    const m = creerMission({ mode, sourceId, client, mission, equipe, reprise })
    fermerWizard()
    toast(`Mission ${m.code} créée pour ${client.raisonSociale}`)
    aller('mission', { id: m.id })
  }

  const choisirClient = (val: string) => {
    setClientChoix(val)
    setClient(val === 'nouveau' ? clientVide() : getClient(val)!)
  }

  const verrouille = mode === 'report'
  const libreCollabs = state.collaborateurs.filter((c) => c.actif && !equipe.some((e) => e.collaborateurId === c.id))

  return (
    <Modal
      large
      titre="Nouvelle mission"
      sousTitre={mode === 'vierge' ? 'Mission vierge' : modes.find((m) => m.id === mode)!.titre}
      onClose={fermerWizard}
      footer={
        <>
          {erreur && <span className="form-error">{erreur}</span>}
          <div className="modal__foot-actions">
            {etape > 0 && <button className="btn btn--ghost" onClick={precedent}><ArrowLeft size={16} /> Précédent</button>}
            {etape < 4
              ? <button className="btn btn--primary" onClick={suivant}>Suivant <ArrowRight size={16} /></button>
              : <button className="btn btn--primary" onClick={creer}><Check size={16} /> Créer la mission</button>}
          </div>
        </>
      }
    >
      <ol className="stepper">
        {etapes.map((e, i) => (
          <li key={e} className={`${i === etape ? 'is-current' : ''} ${i < etape ? 'is-done' : ''} ${i === 1 && mode === 'vierge' ? 'is-skipped' : ''}`}>
            <span>{i < etape ? <Check size={12} /> : i + 1}</span>{e}
          </li>
        ))}
      </ol>

      {etape === 0 && (
        <div className="mode-grid">
          {modes.map(({ id, titre, texte, icon: Icon }) => {
            const n = id === 'report' ? state.missions.filter((m) => m.statut === 'cloturee' && !m.suiteId).length : state.missions.length
            const indispo = id !== 'vierge' && n === 0
            return (
              <button
                key={id}
                className={`mode-card ${mode === id ? 'is-selected' : ''}`}
                onClick={() => choisirMode(id)}
                disabled={indispo}
              >
                <Icon size={24} strokeWidth={1.8} />
                <strong>{titre}</strong>
                <p>{texte}</p>
                {indispo && (
                  <em>{id === 'report' ? 'Aucune mission clôturée sans N+1 pour le moment' : 'Aucune mission existante'}</em>
                )}
              </button>
            )
          })}
        </div>
      )}

      {etape === 1 && (
        <div className="wizard-cols">
          <div>
            <div className="field-label">{mode === 'report' ? 'Mission clôturée (exercice N)' : 'Mission à cloner'}</div>
            {sources.length === 0 && (
              <p className="note note--warn">
                {mode === 'report'
                  ? "Aucune mission clôturée. Clôturez d'abord la mission de l'exercice N (fiche mission › Clôturer)."
                  : 'Aucune mission existante à cloner. Créez d’abord une mission vierge.'}
              </p>
            )}
            <ul className="pick-list">
              {sources.map((m) => {
                const c = getClient(m.clientId)
                const dejaSuivie = mode === 'report' && !!m.suiteId
                return (
                  <li key={m.id}>
                    <label className={`pick ${sourceId === m.id ? 'is-selected' : ''} ${dejaSuivie ? 'is-disabled' : ''}`}>
                      <input type="radio" name="source" checked={sourceId === m.id} disabled={dejaSuivie} onChange={() => setSourceId(m.id)} />
                      <div>
                        <strong>{c?.raisonSociale ?? 'Client inconnu'}</strong>
                        <span className="mono">{m.code} · Ex. {m.exercice} · {m.type}</span>
                        {mode === 'report' && m.arrete && <span>Arrêté au {fmtDate(m.arrete.date)}</span>}
                        {dejaSuivie && <span className="accent">N+1 déjà créée</span>}
                      </div>
                      <span className={`status status--${m.statut}`}>{statutLabels[m.statut]}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
          <div>
            <div className="field-label">Éléments à reprendre</div>
            <ul className="check-list">
              {elementsReprise[mode as 'clone' | 'report'].map((e) => {
                const force = mode === 'report' && e.id === 'client'
                return (
                  <li key={e.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={reprise.includes(e.id)}
                        disabled={force}
                        onChange={(ev) => setReprise(ev.target.checked ? [...reprise, e.id] : reprise.filter((x) => x !== e.id))}
                      />
                      <div><strong>{e.label}</strong><span>{e.detail}</span></div>
                    </label>
                  </li>
                )
              })}
            </ul>
            {mode === 'clone' && (
              <p className="note">Les données financières et les travaux réalisés ne sont jamais clonés : la nouvelle mission démarre sans balance.</p>
            )}
          </div>
        </div>
      )}

      {etape === 2 && (
        <div className="form">
          <fieldset>
            <legend>Client {verrouille && <span className="lock"><Lock size={12} /> repris de l'exercice N</span>}</legend>
            {mode !== 'report' && state.clients.length > 0 && (
              <label className="field field--full">
                <span>Dossier client</span>
                <select value={clientChoix} onChange={(e) => choisirClient(e.target.value)}>
                  <option value="nouveau">+ Nouveau client</option>
                  {state.clients.map((c) => <option key={c.id} value={c.id}>{c.raisonSociale}</option>)}
                </select>
              </label>
            )}
            <div className="form-grid">
              <Field label="Raison sociale *" value={client.raisonSociale} disabled={verrouille} onChange={(v) => setClient({ ...client, raisonSociale: v })} />
              <Field label="Sigle" value={client.sigle} disabled={verrouille} onChange={(v) => setClient({ ...client, sigle: v })} />
              <label className="field">
                <span>Forme juridique</span>
                <select value={client.formeJuridique} disabled={verrouille} onChange={(e) => setClient({ ...client, formeJuridique: e.target.value })}>
                  {formesJuridiques.map((f) => <option key={f}>{f}</option>)}
                </select>
              </label>
              <Field label="N° RCCM" value={client.rccm} disabled={verrouille} onChange={(v) => setClient({ ...client, rccm: v })} />
              <Field label="NIF / NINEA" value={client.nif} disabled={verrouille} onChange={(v) => setClient({ ...client, nif: v })} />
              <Field label="Dirigeant" value={client.dirigeant} disabled={verrouille} onChange={(v) => setClient({ ...client, dirigeant: v })} />
              <Field label="Siège social" value={client.siege} disabled={verrouille} onChange={(v) => setClient({ ...client, siege: v })} />
              <Field label="Activité" value={client.activite} disabled={verrouille} onChange={(v) => setClient({ ...client, activite: v })} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Mission</legend>
            <div className="form-grid">
              <label className="field field--wide">
                <span>Type de mission</span>
                <select value={mission.type} onChange={(e) => setMission({ ...mission, type: e.target.value })}>
                  {typesMission.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <Field
                label="Exercice audité" type="number" value={String(mission.exercice)} disabled={verrouille}
                onChange={(v) => {
                  const a = Number(v) || anneeDefaut
                  setMission({ ...mission, exercice: a, debut: `${a}-01-01`, fin: `${a}-12-31`, echeance: `${a + 1}-06-30` })
                }}
              />
              <Field label="Début d'exercice" type="date" value={mission.debut} disabled={verrouille} onChange={(v) => setMission({ ...mission, debut: v })} />
              <Field label="Fin d'exercice (clôture)" type="date" value={mission.fin} disabled={verrouille} onChange={(v) => setMission({ ...mission, fin: v })} />
              <Field label="Échéance du rapport" type="date" value={mission.echeance} onChange={(v) => setMission({ ...mission, echeance: v })} />
            </div>
          </fieldset>
        </div>
      )}

      {etape === 3 && (
        <div>
          <div className="field-label">Équipe affectée à la mission</div>
          <table className="table">
            <thead><tr><th>Collaborateur</th><th>Profil</th><th>Rôle sur la mission</th><th /></tr></thead>
            <tbody>
              {equipe.map((e, i) => {
                const c = collaborateur(e.collaborateurId)
                return (
                  <tr key={e.collaborateurId}>
                    <td><span className="avatar avatar--sm">{c?.initiales}</span> {c ? `${c.prenom} ${c.nom}` : '—'}</td>
                    <td>{grade(c)}</td>
                    <td>
                      <select className="select-inline" value={e.role} onChange={(ev) => setEquipe(equipe.map((x, j) => (j === i ? { ...x, role: ev.target.value } : x)))}>
                        {rolesMission.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="right">
                      <button className="icon-btn" aria-label="Retirer" onClick={() => setEquipe(equipe.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {libreCollabs.length > 0 ? (
            <div className="add-row">
              <select id="add-collab" className="select-inline" defaultValue="">
                <option value="" disabled>Ajouter un collaborateur…</option>
                {libreCollabs.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom} — {grade(c)}</option>)}
              </select>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  const sel = document.getElementById('add-collab') as HTMLSelectElement
                  const c = collaborateur(sel.value)
                  if (!c) return
                  setEquipe([...equipe, { collaborateurId: c.id, role: profil(c.profilId)?.roleDefaut ?? 'Assistant' }])
                  sel.value = ''
                }}
              >
                <Plus size={16} /> Ajouter
              </button>
            </div>
          ) : (
            <p className="note">Tous les collaborateurs actifs sont affectés. Créez-en de nouveaux dans le module Droits.</p>
          )}
          {!equipe.some((e) => e.role === 'Associé signataire') && equipe.length > 0 && (
            <p className="note note--warn">Aucun associé signataire n'est désigné sur cette mission.</p>
          )}
        </div>
      )}

      {etape === 4 && (
        <div className="recap">
          <dl>
            <dt>Mode de création</dt><dd>{modes.find((m) => m.id === mode)!.titre}{source && <> — depuis <b className="mono">{source.code}</b> (Ex. {source.exercice})</>}</dd>
            <dt>Client</dt><dd>{client.raisonSociale}{client.sigle && ` (${client.sigle})`} · {client.formeJuridique}</dd>
            <dt>Type</dt><dd>{mission.type}</dd>
            <dt>Exercice</dt><dd>{mission.exercice} — du {fmtDate(mission.debut)} au {fmtDate(mission.fin)}</dd>
            <dt>Échéance rapport</dt><dd>{fmtDate(mission.echeance)}</dd>
            <dt>Équipe</dt>
            <dd>{equipe.map((e) => { const c = collaborateur(e.collaborateurId); return `${c?.prenom} ${c?.nom} (${e.role})` }).join(', ')}</dd>
            {mode !== 'vierge' && (<><dt>Éléments repris</dt><dd>{reprise.map(elementLabel).join(', ') || 'Aucun'}</dd></>)}
          </dl>
          <p className="note">
            La mission sera créée au statut <b>Planification</b>. Les éléments financiers (balance, chiffre d'affaires, résultat)
            seront renseignés depuis la mission.
          </p>
        </div>
      )}
    </Modal>
  )
}

function Field({ label, value, onChange, type = 'text', disabled }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
