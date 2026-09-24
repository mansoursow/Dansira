import { useState } from 'react'
import { ArrowLeft, Building2, Check, FolderPlus, Pencil, Search, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ClientForm, { clientVide } from '../components/ClientForm'
import { useStore, fmtDate, statutLabels, type Client } from '../store'
import { useUi } from '../ui'

// ---------------------------------------------------------------------------
// Liste des dossiers clients
// ---------------------------------------------------------------------------

export default function Clients({ onMenu }: { onMenu: () => void }) {
  const { state } = useStore()
  const { aller } = useUi()
  const [q, setQ] = useState('')
  const [edition, setEdition] = useState<Client | null>(null)

  const missionsDe = (id: string) =>
    state.missions.filter((m) => m.clientId === id).sort((a, b) => b.exercice - a.exercice || b.creeLe.localeCompare(a.creeLe))

  const liste = state.clients
    .filter((c) => !q || `${c.raisonSociale} ${c.sigle} ${c.rccm} ${c.nif} ${c.activite}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.raisonSociale.localeCompare(b.raisonSociale, 'fr'))

  return (
    <>
      <PageHeader
        titre="Dossiers clients"
        sousTitre={`${state.clients.length} dossier${state.clients.length > 1 ? 's' : ''} client`}
        onMenu={onMenu}
        actions={<button className="btn btn--primary" onClick={() => setEdition(clientVide())}><Building2 size={16} /> Nouveau client</button>}
      />
      <main className="content">
        <section className="card">
          <div className="toolbar">
            <label className="search">
              <Search size={16} />
              <input placeholder="Rechercher raison sociale, RCCM, NIF…" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>

          {liste.length === 0 ? (
            <div className="empty">
              <div className="empty__icon"><Building2 size={28} strokeWidth={1.6} /></div>
              <h3>{state.clients.length === 0 ? 'Aucun dossier client' : 'Aucun client ne correspond'}</h3>
              <p>Un dossier client est créé automatiquement avec sa première mission. Vous pouvez aussi l'enregistrer à l'avance.</p>
              <div className="empty__actions">
                <button className="btn btn--primary" onClick={() => setEdition(clientVide())}><Building2 size={16} /> Nouveau client</button>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table table--click">
                <thead>
                  <tr><th>Client</th><th>Forme</th><th>RCCM</th><th>NIF / NINEA</th><th>Missions</th><th>Dernière mission</th></tr>
                </thead>
                <tbody>
                  {liste.map((c) => {
                    const ms = missionsDe(c.id)
                    const derniere = ms[0]
                    return (
                      <tr key={c.id} onClick={() => aller('client', { id: c.id })}>
                        <td><strong>{c.raisonSociale}</strong>{c.sigle && <span className="muted"> · {c.sigle}</span>}<div className="muted small">{c.activite}</div></td>
                        <td>{c.formeJuridique}</td>
                        <td className="mono">{c.rccm || '—'}</td>
                        <td className="mono">{c.nif || '—'}</td>
                        <td className="mono">{ms.length}</td>
                        <td>
                          {derniere
                            ? <><span className="mono">Ex. {derniere.exercice}</span> <span className={`status status--${derniere.statut}`}>{statutLabels[derniere.statut]}</span></>
                            : <span className="muted">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {edition && <ClientModal initial={edition} onClose={() => setEdition(null)} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Page d'un dossier client
// ---------------------------------------------------------------------------

export function ClientPage({ onMenu }: { onMenu: () => void }) {
  const { state, client } = useStore()
  const { route, aller, ouvrirWizard } = useUi()
  const c = client(route.params.get('id') ?? '')
  const [edition, setEdition] = useState(false)

  const retour = <button className="back-link" onClick={() => aller('clients')}><ArrowLeft size={15} /> Dossiers clients</button>

  if (!c) {
    return (
      <>
        <PageHeader titre="Dossier introuvable" sousTitre="Il a peut-être été supprimé" onMenu={onMenu} avant={retour} />
        <main className="content" />
      </>
    )
  }

  const missions = state.missions
    .filter((m) => m.clientId === c.id)
    .sort((a, b) => b.exercice - a.exercice || b.creeLe.localeCompare(a.creeLe))

  return (
    <>
      <PageHeader
        avant={retour}
        titre={c.raisonSociale}
        sousTitre={[c.sigle, c.formeJuridique, c.activite].filter(Boolean).join(' · ')}
        onMenu={onMenu}
        actions={
          <>
            <button className="btn btn--ghost" onClick={() => setEdition(true)}><Pencil size={16} /> Modifier</button>
            <button className="btn btn--primary" onClick={() => ouvrirWizard({ mode: 'vierge', clientId: c.id })}><FolderPlus size={16} /> Nouvelle mission</button>
          </>
        }
      />
      <main className="content">
        <div className="client-grid">
          <section className="card">
            <header className="card__head"><h2 className="card__title">Identité</h2></header>
            <dl className="dl">
              <dt>Raison sociale</dt><dd>{c.raisonSociale}</dd>
              <dt>Sigle</dt><dd>{c.sigle || '—'}</dd>
              <dt>Forme juridique</dt><dd>{c.formeJuridique}</dd>
              <dt>N° RCCM</dt><dd className="mono">{c.rccm || '—'}</dd>
              <dt>NIF / NINEA</dt><dd className="mono">{c.nif || '—'}</dd>
              <dt>Dirigeant</dt><dd>{c.dirigeant || '—'}</dd>
              <dt>Siège social</dt><dd>{c.siege || '—'}</dd>
              <dt>Activité</dt><dd>{c.activite || '—'}</dd>
            </dl>
          </section>

          <section className="card">
            <header className="card__head">
              <h2 className="card__title">Missions</h2>
              <span className="chip">{missions.length}</span>
            </header>
            {missions.length === 0 ? (
              <p className="muted">Aucune mission pour ce client. Utilisez « Nouvelle mission » pour en démarrer une.</p>
            ) : (
              <div className="table-wrap">
                <table className="table table--click">
                  <thead><tr><th>Code</th><th>Type</th><th>Exercice</th><th>Statut</th><th>Échéance</th></tr></thead>
                  <tbody>
                    {missions.map((m) => (
                      <tr key={m.id} onClick={() => aller('mission', { id: m.id })}>
                        <td className="mono">{m.code}</td>
                        <td className="muted">{m.type}</td>
                        <td className="mono">{m.exercice}</td>
                        <td><span className={`status status--${m.statut}`}>{statutLabels[m.statut]}</span></td>
                        <td className="mono">{fmtDate(m.echeance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {edition && <ClientModal initial={c} onClose={() => setEdition(false)} />}
    </>
  )
}

// ---------------------------------------------------------------------------

function ClientModal({ initial, onClose }: { initial: Client; onClose: () => void }) {
  const { state, enregistrerClient, supprimerClient } = useStore()
  const { toast, aller } = useUi()
  const [c, setC] = useState(initial)
  const [err, setErr] = useState('')
  const existe = state.clients.some((x) => x.id === c.id)
  const nbMissions = state.missions.filter((m) => m.clientId === c.id).length

  const valider = () => {
    if (!c.raisonSociale.trim()) return setErr('La raison sociale est obligatoire.')
    enregistrerClient({ ...c, raisonSociale: c.raisonSociale.trim() })
    toast(existe ? 'Dossier client mis à jour' : `Dossier « ${c.raisonSociale.trim()} » créé`)
    onClose()
  }

  return (
    <Modal
      large
      titre={existe ? 'Modifier le dossier client' : 'Nouveau dossier client'}
      sousTitre={existe && nbMissions > 0 ? `Modification répercutée sur ${nbMissions} mission(s)` : undefined}
      onClose={onClose}
      footer={
        <>
          {err && <span className="form-error">{err}</span>}
          {existe && (
            <button
              className="btn btn--danger-ghost"
              disabled={nbMissions > 0}
              title={nbMissions > 0 ? 'Impossible : ce client a des missions' : undefined}
              onClick={() => {
                if (!confirm(`Supprimer le dossier « ${c.raisonSociale} » ?`)) return
                supprimerClient(c.id)
                toast('Dossier client supprimé')
                onClose()
                aller('clients')
              }}
            >
              <Trash2 size={16} /> Supprimer
            </button>
          )}
          <div className="modal__foot-actions">
            <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn--primary" onClick={valider}><Check size={16} /> Enregistrer</button>
          </div>
        </>
      }
    >
      <div className="form">
        <ClientForm client={c} onChange={setC} />
        {existe && nbMissions > 0 && <p className="note">Un dossier ayant des missions ne peut pas être supprimé.</p>}
      </div>
    </Modal>
  )
}
