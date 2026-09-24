import { useState } from 'react'
import { FolderPlus, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import {
  useStore, fmtDate, statutLabels, type StatutMission,
} from '../store'
import { useUi } from '../ui'

const filtres: { id: 'toutes' | StatutMission; label: string }[] = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'planification', label: 'Planification' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'revue', label: 'En revue' },
  { id: 'cloturee', label: 'Clôturées' },
]

const origineLabel = { vierge: 'Vierge', clone: 'Clonage', report: 'Reprise N+1' } as const

export default function Missions({ onMenu }: { onMenu: () => void }) {
  const { state, client, collaborateur } = useStore()
  const { route, aller, ouvrirWizard } = useUi()
  const filtre = (route.params.get('statut') ?? 'toutes') as 'toutes' | StatutMission
  const [q, setQ] = useState('')

  const liste = state.missions
    .filter((m) => filtre === 'toutes' || m.statut === filtre)
    .filter((m) => {
      if (!q) return true
      const t = `${m.code} ${client(m.clientId)?.raisonSociale} ${m.type} ${m.exercice}`.toLowerCase()
      return t.includes(q.toLowerCase())
    })
    .sort((a, b) => b.creeLe.localeCompare(a.creeLe))

  const setFiltre = (f: string) => aller('missions', f === 'toutes' ? {} : { statut: f })

  return (
    <>
      <PageHeader
        titre="Missions"
        sousTitre={`${state.missions.length} mission${state.missions.length > 1 ? 's' : ''} · ${state.clients.length} dossier${state.clients.length > 1 ? 's' : ''} client`}
        onMenu={onMenu}
        actions={<button className="btn btn--primary" onClick={() => ouvrirWizard()}><FolderPlus size={16} /> Nouvelle mission</button>}
      />
      <main className="content">
        <section className="card">
          <div className="toolbar">
            <div className="tabs">
              {filtres.map((f) => {
                const n = f.id === 'toutes' ? state.missions.length : state.missions.filter((m) => m.statut === f.id).length
                return (
                  <button key={f.id} className={`tab ${filtre === f.id ? 'is-active' : ''}`} onClick={() => setFiltre(f.id)}>
                    {f.label} <span className="tab__count">{n}</span>
                  </button>
                )
              })}
            </div>
            <label className="search">
              <Search size={16} />
              <input placeholder="Rechercher client, code, type…" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>

          {liste.length === 0 ? (
            <div className="empty">
              <div className="empty__icon"><FolderPlus size={28} strokeWidth={1.6} /></div>
              <h3>{state.missions.length === 0 ? 'Aucune mission pour le moment' : 'Aucune mission ne correspond'}</h3>
              <p>Créez une mission vierge, clonez une mission existante ou démarrez l'exercice N+1 d'une mission clôturée.</p>
              <div className="empty__actions">
                <button className="btn btn--primary" onClick={() => ouvrirWizard()}><FolderPlus size={16} /> Nouvelle mission</button>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table table--click">
                <thead>
                  <tr><th>Code</th><th>Client</th><th>Type</th><th>Exercice</th><th>Origine</th><th>Statut</th><th>Échéance</th><th>Équipe</th></tr>
                </thead>
                <tbody>
                  {liste.map((m) => (
                    <tr key={m.id} onClick={() => aller('mission', { id: m.id })}>
                      <td className="mono">{m.code}</td>
                      <td><strong>{client(m.clientId)?.raisonSociale}</strong></td>
                      <td className="muted">{m.type}</td>
                      <td className="mono">{m.exercice}</td>
                      <td>
                        <span className="muted">{origineLabel[m.origine.mode]}</span>
                        {m.origine.sourceCode && <span className="mono muted"> ← {m.origine.sourceCode}</span>}
                      </td>
                      <td><span className={`status status--${m.statut}`}>{statutLabels[m.statut]}</span></td>
                      <td className="mono">{fmtDate(m.echeance)}</td>
                      <td>
                        <div className="avatars">
                          {m.equipe.slice(0, 4).map((e) => (
                            <span key={e.collaborateurId} className="avatar avatar--sm" title={`${collaborateur(e.collaborateurId)?.prenom} ${collaborateur(e.collaborateurId)?.nom} — ${e.role}`}>
                              {collaborateur(e.collaborateurId)?.initiales}
                            </span>
                          ))}
                          {m.equipe.length > 4 && <span className="avatar avatar--sm avatar--more">+{m.equipe.length - 4}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
