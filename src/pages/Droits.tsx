import { useState } from 'react'
import { UserPlus, ShieldPlus, Trash2, Plus, Lock, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import {
  useStore, uid, permissionsLabels, toutesPermissions, rolesMission, statutLabels,
  type Collaborateur, type Profil,
} from '../store'
import { useUi } from '../ui'

type Onglet = 'collaborateurs' | 'profils' | 'affectations'

const onglets: { id: Onglet; label: string }[] = [
  { id: 'collaborateurs', label: 'Collaborateurs' },
  { id: 'profils', label: 'Profils & habilitations' },
  { id: 'affectations', label: 'Affectations aux missions' },
]

export default function Droits({ onMenu }: { onMenu: () => void }) {
  const { state } = useStore()
  const { route, aller } = useUi()
  const onglet = (route.params.get('tab') ?? 'collaborateurs') as Onglet
  const [editCollab, setEditCollab] = useState<Collaborateur | null>(null)
  const [editProfil, setEditProfil] = useState<Profil | null>(null)

  const nouveauCollab = (): Collaborateur => ({
    id: uid(), nom: '', prenom: '', initiales: '', email: '', telephone: '', profilId: 'p-stagiaire', actif: true,
  })
  const nouveauProfil = (): Profil => ({ id: uid(), nom: '', description: '', permissions: ['travaux.saisir'], systeme: false, roleDefaut: 'Assistant' })

  return (
    <>
      <PageHeader
        titre="Droits"
        sousTitre={`${state.collaborateurs.filter((c) => c.actif).length} collaborateur(s) actif(s) · ${state.profils.length} profils`}
        onMenu={onMenu}
        actions={
          onglet === 'profils'
            ? <button className="btn btn--primary" onClick={() => setEditProfil(nouveauProfil())}><ShieldPlus size={16} /> Nouveau profil</button>
            : <button className="btn btn--primary" onClick={() => setEditCollab(nouveauCollab())}><UserPlus size={16} /> Nouveau collaborateur</button>
        }
      />
      <main className="content">
        <div className="tabs tabs--page">
          {onglets.map((o) => (
            <button key={o.id} className={`tab ${onglet === o.id ? 'is-active' : ''}`} onClick={() => aller('droits', { tab: o.id })}>
              {o.label}
            </button>
          ))}
        </div>

        {onglet === 'collaborateurs' && <Collaborateurs onEdit={setEditCollab} />}
        {onglet === 'profils' && <Profils onEdit={setEditProfil} />}
        {onglet === 'affectations' && <Affectations missionId={route.params.get('mission')} />}
      </main>

      {editCollab && <CollabModal initial={editCollab} onClose={() => setEditCollab(null)} />}
      {editProfil && <ProfilModal initial={editProfil} onClose={() => setEditProfil(null)} />}
    </>
  )
}

// ---------------------------------------------------------------------------

function Collaborateurs({ onEdit }: { onEdit: (c: Collaborateur) => void }) {
  const { state, profil, grade } = useStore()
  return (
    <section className="card">
      <div className="table-wrap">
        <table className="table table--click">
          <thead><tr><th>Collaborateur</th><th>Grade</th><th>E-mail</th><th>Téléphone</th><th>Missions</th><th>Statut</th></tr></thead>
          <tbody>
            {state.collaborateurs.map((c) => {
              const n = state.missions.filter((m) => m.statut !== 'cloturee' && m.equipe.some((e) => e.collaborateurId === c.id)).length
              return (
                <tr key={c.id} onClick={() => onEdit(c)}>
                  <td><span className="avatar avatar--sm">{c.initiales}</span> <strong>{c.prenom} {c.nom}</strong></td>
                  <td><strong className="mono">{grade(c)}</strong> <span className="muted small">{profil(c.profilId)?.description}</span></td>
                  <td className="muted">{c.email || '—'}</td>
                  <td className="muted">{c.telephone || '—'}</td>
                  <td className="mono">{n} en cours</td>
                  <td><span className={`status ${c.actif ? 'status--cloturee' : ''}`}>{c.actif ? 'Actif' : 'Inactif'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="note">Cliquez sur un collaborateur pour modifier sa fiche ou son grade. Un collaborateur inactif ne peut plus être affecté à une mission.</p>
    </section>
  )
}

function CollabModal({ initial, onClose }: { initial: Collaborateur; onClose: () => void }) {
  const { state, enregistrerCollaborateur, profil } = useStore()
  const { toast } = useUi()
  const [c, setC] = useState(initial)
  const [err, setErr] = useState('')
  const existe = state.collaborateurs.some((x) => x.id === c.id)
  const poste = c.id === 'c-audit'

  const initialesAuto = (p: string, n: string) => `${p.trim()[0] ?? ''}${n.trim()[0] ?? ''}`.toUpperCase()

  const valider = () => {
    if (!c.nom.trim() || !c.prenom.trim()) return setErr('Le nom et le prénom sont obligatoires.')
    const niveaux = profil(c.profilId)?.niveaux
    const niveau = niveaux ? (c.niveau && niveaux.includes(c.niveau) ? c.niveau : niveaux[0]) : undefined
    enregistrerCollaborateur({ ...c, niveau, initiales: c.initiales || initialesAuto(c.prenom, c.nom) })
    toast(existe ? 'Collaborateur mis à jour' : `${c.prenom} ${c.nom} ajouté(e)`)
    onClose()
  }

  const p = profil(c.profilId)

  return (
    <Modal
      titre={existe ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
      onClose={onClose}
      footer={
        <>
          {err && <span className="form-error">{err}</span>}
          <div className="modal__foot-actions">
            <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn--primary" onClick={valider}><Check size={16} /> Enregistrer</button>
          </div>
        </>
      }
    >
      <div className="form">
        <div className="form-grid">
          <label className="field"><span>Prénom *</span>
            <input value={c.prenom} onChange={(e) => setC({ ...c, prenom: e.target.value, initiales: initialesAuto(e.target.value, c.nom) })} /></label>
          <label className="field"><span>Nom *</span>
            <input value={c.nom} onChange={(e) => setC({ ...c, nom: e.target.value, initiales: initialesAuto(c.prenom, e.target.value) })} /></label>
          <label className="field"><span>Initiales</span>
            <input maxLength={3} value={c.initiales} onChange={(e) => setC({ ...c, initiales: e.target.value.toUpperCase() })} /></label>
          <label className="field"><span>E-mail</span>
            <input type="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} /></label>
          <label className="field"><span>Téléphone</span>
            <input value={c.telephone} onChange={(e) => setC({ ...c, telephone: e.target.value })} /></label>
          <label className="field"><span>Grade / profil</span>
            <select value={c.profilId} disabled={poste} onChange={(e) => setC({ ...c, profilId: e.target.value, niveau: profil(e.target.value)?.niveaux?.[0] })}>
              {state.profils.map((pr) => <option key={pr.id} value={pr.id}>{pr.nom} — {pr.description}</option>)}
            </select></label>
          {p?.niveaux && (
            <label className="field"><span>Niveau</span>
              <select value={c.niveau ?? p.niveaux[0]} onChange={(e) => setC({ ...c, niveau: e.target.value })}>
                {p.niveaux.map((n) => <option key={n}>{n}</option>)}
              </select></label>
          )}
        </div>
        {p && (
          <div className="perm-preview">
            <div className="field-label">Habilitations du profil « {p.nom} »</div>
            <ul>{p.permissions.map((x) => <li key={x}><Check size={13} /> {permissionsLabels[x]}</li>)}</ul>
          </div>
        )}
        <label className="switch">
          <input type="checkbox" checked={c.actif} disabled={poste} onChange={(e) => setC({ ...c, actif: e.target.checked })} />
          <span>Collaborateur actif</span>
          {poste && <em className="muted">(poste administrateur principal)</em>}
        </label>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------

function Profils({ onEdit }: { onEdit: (p: Profil) => void }) {
  const { state, enregistrerProfil } = useStore()
  const toggle = (p: Profil, perm: (typeof toutesPermissions)[number]) =>
    enregistrerProfil({ ...p, permissions: p.permissions.includes(perm) ? p.permissions.filter((x) => x !== perm) : [...p.permissions, perm] })

  return (
    <section className="card">
      <div className="table-wrap">
        <table className="table matrix">
          <thead>
            <tr>
              <th>Habilitation</th>
              {state.profils.map((p) => (
                <th key={p.id}>
                  <button className="link" onClick={() => onEdit(p)}>{p.nom}</button>
                  <div className="matrix__count">{p.description}</div>
                  <div className="matrix__count">{state.collaborateurs.filter((c) => c.profilId === p.id).length} collab.</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {toutesPermissions.map((perm) => (
              <tr key={perm}>
                <td>{permissionsLabels[perm]}</td>
                {state.profils.map((p) => {
                  const admin = p.id === 'p-admin'
                  return (
                    <td key={p.id} className="center">
                      <input
                        type="checkbox"
                        aria-label={`${p.nom} — ${permissionsLabels[perm]}`}
                        checked={p.permissions.includes(perm)}
                        disabled={admin}
                        onChange={() => toggle(p, perm)}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note"><Lock size={12} /> Le profil Administrateur dispose de toutes les habilitations et n'est pas modifiable. Cochez / décochez pour ajuster les autres profils ; cliquez sur un nom de profil pour le renommer ou le supprimer.</p>
    </section>
  )
}

function ProfilModal({ initial, onClose }: { initial: Profil; onClose: () => void }) {
  const { state, enregistrerProfil, supprimerProfil } = useStore()
  const { toast } = useUi()
  const [p, setP] = useState(initial)
  const [err, setErr] = useState('')
  const existe = state.profils.some((x) => x.id === p.id)
  const utilise = state.collaborateurs.some((c) => c.profilId === p.id)

  const valider = () => {
    if (!p.nom.trim()) return setErr('Le nom du profil est obligatoire.')
    enregistrerProfil(p)
    toast(existe ? 'Profil mis à jour' : `Profil « ${p.nom} » créé`)
    onClose()
  }

  return (
    <Modal
      titre={existe ? `Profil « ${initial.nom} »` : 'Nouveau profil'}
      onClose={onClose}
      footer={
        <>
          {err && <span className="form-error">{err}</span>}
          {existe && !p.systeme && (
            <button
              className="btn btn--danger-ghost"
              disabled={utilise}
              title={utilise ? 'Profil attribué à des collaborateurs' : undefined}
              onClick={() => { supprimerProfil(p.id); toast('Profil supprimé'); onClose() }}
            >
              <Trash2 size={16} /> Supprimer
            </button>
          )}
          <div className="modal__foot-actions">
            <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn--primary" disabled={p.id === 'p-admin'} onClick={valider}><Check size={16} /> Enregistrer</button>
          </div>
        </>
      }
    >
      <div className="form">
        {!existe && (
          <label className="field">
            <span>Partir du profil</span>
            <select defaultValue="" onChange={(e) => {
              const src = state.profils.find((x) => x.id === e.target.value)
              if (src) setP({ ...p, permissions: [...src.permissions], roleDefaut: src.roleDefaut })
            }}>
              <option value="">— Aucun —</option>
              {state.profils.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}
            </select>
          </label>
        )}
        <label className="field"><span>Nom du profil *</span>
          <input value={p.nom} disabled={p.systeme} onChange={(e) => setP({ ...p, nom: e.target.value })} /></label>
        <label className="field"><span>Description</span>
          <input value={p.description} disabled={p.id === 'p-admin'} onChange={(e) => setP({ ...p, description: e.target.value })} /></label>
        <div className="form-grid form-grid--2">
          <label className="field"><span>Niveaux (optionnel, séparés par /)</span>
            <input
              value={p.niveaux?.join(' / ') ?? ''}
              disabled={p.systeme}
              placeholder="ex. J1 / J2"
              onChange={(e) => {
                const n = e.target.value.split('/').map((x) => x.trim()).filter(Boolean)
                setP({ ...p, niveaux: n.length ? n : undefined })
              }}
            /></label>
          <label className="field"><span>Rôle proposé sur une mission</span>
            <select value={p.roleDefaut} disabled={p.id === 'p-admin'} onChange={(e) => setP({ ...p, roleDefaut: e.target.value })}>
              {rolesMission.map((x) => <option key={x}>{x}</option>)}
            </select></label>
        </div>
        <div className="field-label">Habilitations</div>
        <ul className="check-list check-list--compact">
          {toutesPermissions.map((perm) => (
            <li key={perm}>
              <label>
                <input
                  type="checkbox"
                  disabled={p.id === 'p-admin'}
                  checked={p.permissions.includes(perm)}
                  onChange={(e) => setP({ ...p, permissions: e.target.checked ? [...p.permissions, perm] : p.permissions.filter((x) => x !== perm) })}
                />
                <div><strong>{permissionsLabels[perm]}</strong></div>
              </label>
            </li>
          ))}
        </ul>
        {p.systeme && <p className="note">Grade livré avec le logiciel : son nom et ses niveaux sont fixes ; habilitations et rôle proposé restent ajustables.</p>}
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------

function Affectations({ missionId }: { missionId: string | null }) {
  const { state, client, collaborateur, profil, grade, affecter, retirer } = useStore()
  const { aller, ouvrirWizard } = useUi()
  const [ajout, setAjout] = useState('')
  const [role, setRole] = useState('Assistant')

  const missions = [...state.missions].sort((a, b) => Number(a.statut === 'cloturee') - Number(b.statut === 'cloturee') || b.creeLe.localeCompare(a.creeLe))
  const m = state.missions.find((x) => x.id === missionId) ?? missions[0]

  if (!m) {
    return (
      <section className="card">
        <div className="empty">
          <h3>Aucune mission à laquelle affecter des collaborateurs</h3>
          <p>Créez d'abord une mission ; vous pourrez ensuite y affecter l'équipe ici ou directement dans l'assistant de création.</p>
          <div className="empty__actions"><button className="btn btn--primary" onClick={() => ouvrirWizard()}>Nouvelle mission</button></div>
        </div>
      </section>
    )
  }

  const ferme = m.statut === 'cloturee'
  const libres = state.collaborateurs.filter((c) => c.actif && !m.equipe.some((e) => e.collaborateurId === c.id))

  return (
    <div className="split">
      <section className="card split__list">
        <div className="field-label">Missions</div>
        <ul className="pick-list">
          {missions.map((x) => (
            <li key={x.id}>
              <button className={`pick ${x.id === m.id ? 'is-selected' : ''}`} onClick={() => aller('droits', { tab: 'affectations', mission: x.id })}>
                <div>
                  <strong>{client(x.clientId)?.raisonSociale}</strong>
                  <span className="mono">{x.code} · Ex. {x.exercice} · {x.equipe.length} membre(s)</span>
                </div>
                <span className={`status status--${x.statut}`}>{statutLabels[x.statut]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <header className="card__head">
          <h2 className="card__title">Équipe — {m.code} · {client(m.clientId)?.raisonSociale}</h2>
          {ferme && <span className="chip"><Lock size={11} /> Lecture seule</span>}
        </header>
        <table className="table">
          <thead><tr><th>Collaborateur</th><th>Profil</th><th>Rôle sur la mission</th><th /></tr></thead>
          <tbody>
            {m.equipe.map((e) => {
              const c = collaborateur(e.collaborateurId)
              return (
                <tr key={e.collaborateurId}>
                  <td><span className="avatar avatar--sm">{c?.initiales}</span> {c?.prenom} {c?.nom}</td>
                  <td className="muted mono">{grade(c)}</td>
                  <td>
                    <select className="select-inline" disabled={ferme} value={e.role} onChange={(ev) => affecter(m.id, { ...e, role: ev.target.value })}>
                      {rolesMission.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="right">
                    {!ferme && <button className="icon-btn" aria-label="Retirer" onClick={() => retirer(m.id, e.collaborateurId)}><Trash2 size={16} /></button>}
                  </td>
                </tr>
              )
            })}
            {m.equipe.length === 0 && <tr><td colSpan={4} className="muted">Aucun collaborateur affecté.</td></tr>}
          </tbody>
        </table>

        {!ferme && (libres.length > 0 ? (
          <div className="add-row">
            <select className="select-inline" value={ajout} onChange={(e) => {
              setAjout(e.target.value)
              const r = profil(collaborateur(e.target.value)?.profilId ?? '')?.roleDefaut
              if (r) setRole(r)
            }}>
              <option value="">Choisir un collaborateur…</option>
              {libres.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom} — {grade(c)}</option>)}
            </select>
            <select className="select-inline" value={role} onChange={(e) => setRole(e.target.value)}>
              {rolesMission.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="btn btn--primary" disabled={!ajout} onClick={() => { affecter(m.id, { collaborateurId: ajout, role }); setAjout('') }}>
              <Plus size={16} /> Affecter
            </button>
          </div>
        ) : <p className="note">Tous les collaborateurs actifs sont déjà affectés à cette mission.</p>)}
        {ferme && <p className="note">Une mission clôturée est figée : l'équipe ne peut plus être modifiée.</p>}
      </section>
    </div>
  )
}
