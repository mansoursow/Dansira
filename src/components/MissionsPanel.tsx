import { FolderPlus, Copy, CalendarClock } from 'lucide-react'
import { etapesDemarrage, typesMission } from '../data/cabinet'
import { useStore, statutLabels, fmtDate } from '../store'
import { useUi } from '../ui'

export default function MissionsPanel() {
  const { state, client } = useStore()
  const { ouvrirWizard, aller } = useUi()
  const recentes = [...state.missions].sort((a, b) => b.creeLe.localeCompare(a.creeLe)).slice(0, 5)
  const nbCloturees = state.missions.filter((m) => m.statut === 'cloturee' && !m.suiteId).length

  return (
    <section className="card missions">
      <header className="card__head">
        <h2 className="card__title">Missions récentes</h2>
        {state.missions.length > 0
          ? <button className="link" onClick={() => aller('missions')}>Voir tout ({state.missions.length})</button>
          : <span className="chip">0 mission</span>}
      </header>

      {recentes.length === 0 ? (
        <div className="empty">
          <div className="empty__icon"><FolderPlus size={28} strokeWidth={1.6} /></div>
          <h3>Aucune mission pour le moment</h3>
          <p>
            Les éléments financiers du client (chiffre d'affaires, résultat, bilan, anomalies)
            sont renseignés à l'intérieur d'une mission. Démarrez-en une pour commencer.
          </p>
          <div className="empty__actions">
            <button className="btn btn--primary" onClick={() => ouvrirWizard({ mode: 'vierge' })}>
              <FolderPlus size={16} /> Démarrer une mission
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table table--click">
              <thead>
                <tr><th>Code</th><th>Client</th><th>Exercice</th><th>Statut</th><th>Échéance</th></tr>
              </thead>
              <tbody>
                {recentes.map((m) => (
                  <tr key={m.id} onClick={() => aller('mission', { id: m.id })}>
                    <td className="mono">{m.code}</td>
                    <td><strong>{client(m.clientId)?.raisonSociale}</strong><div className="muted small">{m.type}</div></td>
                    <td className="mono">{m.exercice}</td>
                    <td><span className={`status status--${m.statut}`}>{statutLabels[m.statut]}</span></td>
                    <td className="mono">{fmtDate(m.echeance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="quick-create">
            <button className="btn btn--ghost" onClick={() => ouvrirWizard({ mode: 'vierge' })}><FolderPlus size={16} /> Mission vierge</button>
            <button className="btn btn--ghost" onClick={() => ouvrirWizard({ mode: 'clone' })}><Copy size={16} /> Cloner</button>
            <button className="btn btn--ghost" disabled={nbCloturees === 0} onClick={() => ouvrirWizard({ mode: 'report' })}>
              <CalendarClock size={16} /> Reprise N → N+1
            </button>
          </div>
        </>
      )}

      {state.missions.length === 0 && (
        <div className="steps">
          <div className="steps__title">Déroulé d'une mission</div>
          <ol>
            {etapesDemarrage.map((e, i) => (
              <li key={e.titre}>
                <span className="steps__num">{i + 1}</span>
                <div>
                  <strong>{e.titre}</strong>
                  <p>{e.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="steps__types">
            {typesMission.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
      )}
    </section>
  )
}
