import { useState } from 'react'
import { X, CalendarClock, Copy, ArrowRight, Lock, Trash2, Users } from 'lucide-react'
import Modal from './Modal'
import { useStore, fmtDate, statutLabels, elementLabel, type Mission, type StatutMission } from '../store'
import { useUi } from '../ui'

const origineLabel = { vierge: 'Vierge', clone: 'Clonage', report: 'Reprise N+1' } as const

const suivantStatut: Partial<Record<StatutMission, StatutMission>> = { planification: 'en_cours', en_cours: 'revue' }

export default function MissionDrawer({ mission: m, onClose }: { mission: Mission; onClose: () => void }) {
  const { state, client, collaborateur, majMission, cloturerMission, supprimerMission } = useStore()
  const { ouvrirWizard, aller, toast } = useUi()
  const [cloture, setCloture] = useState(false)
  const c = client(m.clientId)
  const suite = state.missions.find((x) => x.id === m.suiteId)
  const next = suivantStatut[m.statut]
  const ferme = m.statut === 'cloturee'

  return (
    <>
      <div className="drawer-layer" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={`Mission ${m.code}`}>
        <header className="drawer__head">
          <div>
            <div className="mono muted">{m.code}</div>
            <h2>{c?.raisonSociale}</h2>
            <span className={`status status--${m.statut}`}>{ferme && <Lock size={11} />} {statutLabels[m.statut]}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </header>

        <div className="drawer__body">
          <div className="progress">
            {(['planification', 'en_cours', 'revue', 'cloturee'] as StatutMission[]).map((s, i, arr) => (
              <div key={s} className={`progress__step ${arr.indexOf(m.statut) >= i ? 'is-done' : ''}`}>
                <span />{statutLabels[s]}
              </div>
            ))}
          </div>

          <div className="drawer__actions">
            {next && (
              <button className="btn btn--ghost" onClick={() => majMission(m.id, { statut: next, avancement: next === 'revue' ? 80 : 30 })}>
                <ArrowRight size={16} /> Passer « {statutLabels[next]} »
              </button>
            )}
            {!ferme && <button className="btn btn--primary" onClick={() => setCloture(true)}><Lock size={16} /> Clôturer (arrêté)</button>}
            {ferme && !suite && (
              <button className="btn btn--primary" onClick={() => ouvrirWizard({ mode: 'report', sourceId: m.id })}>
                <CalendarClock size={16} /> Démarrer l'exercice {m.exercice + 1}
              </button>
            )}
            {suite && (
              <button className="btn btn--ghost" onClick={() => aller('mission', { id: suite.id })}>
                <ArrowRight size={16} /> Voir la mission N+1 ({suite.code})
              </button>
            )}
            <button className="btn btn--ghost" onClick={() => ouvrirWizard({ mode: 'clone', sourceId: m.id })}><Copy size={16} /> Cloner</button>
          </div>

          <h3 className="drawer__title">Mission</h3>
          <dl className="dl">
            <dt>Type</dt><dd>{m.type}</dd>
            <dt>Exercice</dt><dd>{m.exercice} — du {fmtDate(m.debut)} au {fmtDate(m.fin)}</dd>
            <dt>Échéance rapport</dt><dd>{fmtDate(m.echeance)}</dd>
            <dt>Origine</dt>
            <dd>
              {origineLabel[m.origine.mode]}
              {m.origine.sourceId && (
                <> — <button className="link" onClick={() => aller('mission', { id: m.origine.sourceId! })}>{m.origine.sourceCode}</button></>
              )}
            </dd>
            {m.reprise.length > 0 && (<><dt>Éléments repris</dt><dd>{m.reprise.map(elementLabel).join(', ')}</dd></>)}
            {m.arrete && (<><dt>Arrêté au</dt><dd>{fmtDate(m.arrete.date)}{m.arrete.commentaire && ` — ${m.arrete.commentaire}`}</dd></>)}
            <dt>Créée le</dt><dd>{fmtDate(m.creeLe)}</dd>
          </dl>

          <h3 className="drawer__title">Client</h3>
          <dl className="dl">
            <dt>Forme juridique</dt><dd>{c?.formeJuridique}{c?.sigle && ` · ${c.sigle}`}</dd>
            <dt>RCCM</dt><dd>{c?.rccm || '—'}</dd>
            <dt>NIF / NINEA</dt><dd>{c?.nif || '—'}</dd>
            <dt>Dirigeant</dt><dd>{c?.dirigeant || '—'}</dd>
            <dt>Siège</dt><dd>{c?.siege || '—'}</dd>
            <dt>Activité</dt><dd>{c?.activite || '—'}</dd>
          </dl>

          <h3 className="drawer__title">
            Équipe
            <button className="link" onClick={() => aller('droits', { tab: 'affectations', mission: m.id })}><Users size={13} /> Gérer</button>
          </h3>
          <ul className="team">
            {m.equipe.map((e) => {
              const col = collaborateur(e.collaborateurId)
              return (
                <li key={e.collaborateurId}>
                  <span className="avatar avatar--sm">{col?.initiales}</span>
                  <div><strong>{col?.prenom} {col?.nom}</strong><span>{e.role}</span></div>
                </li>
              )
            })}
            {m.equipe.length === 0 && <li className="muted">Aucun collaborateur affecté</li>}
          </ul>

          <button
            className="btn btn--danger-ghost"
            onClick={() => {
              if (confirm(`Supprimer définitivement la mission ${m.code} ?`)) {
                supprimerMission(m.id)
                toast(`Mission ${m.code} supprimée`)
                aller('missions')
              }
            }}
          >
            <Trash2 size={16} /> Supprimer la mission
          </button>
        </div>
      </aside>

      {cloture && <ClotureModal mission={m} onClose={() => setCloture(false)} onValider={(d, com) => { cloturerMission(m.id, d, com); setCloture(false); toast(`Mission ${m.code} clôturée — arrêté au ${fmtDate(d)}`) }} />}
    </>
  )
}

function ClotureModal({ mission, onClose, onValider }: { mission: Mission; onClose: () => void; onValider: (date: string, commentaire: string) => void }) {
  const [date, setDate] = useState(mission.fin)
  const [com, setCom] = useState('')
  return (
    <Modal
      titre="Clôturer la mission"
      sousTitre={`${mission.code} · Exercice ${mission.exercice}`}
      onClose={onClose}
      footer={
        <div className="modal__foot-actions">
          <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn--primary" onClick={() => onValider(date, com)}><Lock size={16} /> Clôturer</button>
        </div>
      }
    >
      <div className="form">
        <p className="note">
          La clôture fige la mission en lecture seule et enregistre l'<b>arrêté</b>. Les soldes à cette date serviront
          d'à-nouveaux pour la mission de l'exercice {mission.exercice + 1}.
        </p>
        <label className="field">
          <span>Date d'arrêté des comptes</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Commentaire (opinion émise, réserves…)</span>
          <textarea rows={3} value={com} onChange={(e) => setCom(e.target.value)} placeholder="Ex. : Certification sans réserve" />
        </label>
      </div>
    </Modal>
  )
}
