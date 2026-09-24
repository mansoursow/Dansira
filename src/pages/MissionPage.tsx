import { useEffect, useState } from 'react'
import { ArrowLeft, Info, Lock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import MissionDrawer from '../components/MissionDrawer'
import { useStore, fmtDate, statutLabels } from '../store'
import { useUi } from '../ui'

// Espace de travail d'une mission. Vierge pour l'instant :
// c'est ici que seront construits les travaux (balance, programme, feuilles de travail…).
export default function MissionPage({ onMenu }: { onMenu: () => void }) {
  const { state, client } = useStore()
  const { route, aller } = useUi()
  const m = state.missions.find((x) => x.id === route.params.get('id'))
  const [fiche, setFiche] = useState(false)

  useEffect(() => setFiche(false), [m?.id])

  const retour = (
    <button className="back-link" onClick={() => aller('missions')}><ArrowLeft size={15} /> Missions</button>
  )

  if (!m) {
    return (
      <>
        <PageHeader titre="Mission introuvable" sousTitre="Elle a peut-être été supprimée" onMenu={onMenu} avant={retour} />
        <main className="content" />
      </>
    )
  }

  const c = client(m.clientId)

  return (
    <>
      <PageHeader
        avant={retour}
        titre={c?.raisonSociale ?? m.code}
        sousTitre={`${m.code} · ${m.type} · Exercice ${m.exercice} (${fmtDate(m.debut)} → ${fmtDate(m.fin)})`}
        onMenu={onMenu}
        actions={
          <>
            <span className={`status status--${m.statut}`}>
              {m.statut === 'cloturee' && <Lock size={11} />} {statutLabels[m.statut]}
            </span>
            <button className="btn btn--ghost" onClick={() => setFiche(true)}><Info size={16} /> Fiche mission</button>
          </>
        }
      />
      <main className="content">
        <section className="workspace" aria-label="Espace de travail de la mission" />
      </main>

      {fiche && <MissionDrawer mission={m} onClose={() => setFiche(false)} />}
    </>
  )
}
