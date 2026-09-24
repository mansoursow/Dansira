import { useEffect, useState } from 'react'
import { FolderPlus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ActionTiles from '../components/ActionTiles'
import KpiCard from '../components/KpiCard'
import MissionsPanel from '../components/MissionsPanel'
import NewsPanel from '../components/NewsPanel'
import { cabinet } from '../data/cabinet'
import { useStore } from '../store'
import { useUi } from '../ui'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function Dashboard({ onMenu }: { onMenu: () => void }) {
  const now = useClock()
  const { state } = useStore()
  const { ouvrirWizard } = useUi()
  const { missions, collaborateurs } = state

  const in30days = Date.now() + 30 * 864e5
  const stats = {
    enCours: missions.filter((m) => m.statut === 'en_cours' || m.statut === 'planification').length,
    revue: missions.filter((m) => m.statut === 'revue').length,
    cloturees: missions.filter((m) => m.statut === 'cloturee').length,
    clients: new Set(missions.map((m) => m.clientId)).size,
    echeances: missions.filter((m) => m.statut !== 'cloturee' && new Date(m.echeance).getTime() <= in30days).length,
    collabs: collaborateurs.filter((c) => c.actif).length,
  }

  const date = now.toLocaleDateString('fr-FR')
  const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <PageHeader
        titre="Tableau de bord"
        sousTitre={`${state.cabinet.nom} — Exercice ${state.cabinet.exercice}`}
        onMenu={onMenu}
        actions={
          <>
            <span className="stamp mono">{date} · {heure}</span>
            <button className="btn btn--primary" onClick={() => ouvrirWizard()}>
              <FolderPlus size={16} /> Nouvelle mission
            </button>
          </>
        }
      />
      <main className="content">
        <ActionTiles />

        <div className="kpis">
          <KpiCard label="Missions en cours" value={stats.enCours} hint={stats.enCours ? 'Planification & terrain' : 'Aucune mission ouverte'} />
          <KpiCard label="En revue / à signer" value={stats.revue} hint="Revue associé signataire" />
          <KpiCard label="Missions clôturées" value={stats.cloturees} hint={stats.cloturees ? 'Arrêtés enregistrés' : 'Aucun arrêté enregistré'} />
          <KpiCard label="Dossiers clients" value={stats.clients} hint={stats.clients ? 'Clients avec mission' : 'Aucun client enregistré'} />
          <KpiCard
            label="Échéances à 30 jours"
            value={stats.echeances}
            hint={stats.echeances ? <b className="accent">Rapports à émettre</b> : 'Rien de planifié'}
          />
          <KpiCard label="Collaborateurs" value={stats.collabs} hint={`${cabinet.licences} licence${cabinet.licences > 1 ? 's' : ''} active${cabinet.licences > 1 ? 's' : ''}`} />
        </div>

        <div className="grid">
          <MissionsPanel />
          <NewsPanel />
        </div>
      </main>
    </>
  )
}
