import { useState } from 'react'
import Sidebar from './components/Sidebar'
import StatusBar from './components/StatusBar'
import NewMissionWizard from './components/NewMissionWizard'
import Dashboard from './pages/Dashboard'
import Missions from './pages/Missions'
import MissionPage from './pages/MissionPage'
import Clients, { ClientPage } from './pages/Clients'
import Droits from './pages/Droits'
import Parametrage from './pages/Parametrage'
import Memento from './pages/Memento'
import { useUi } from './ui'

export default function App() {
  const { route, wizard } = useUi()
  const [menuOpen, setMenuOpen] = useState(false)
  const onMenu = () => setMenuOpen(true)

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}

      <div className="main">
        {route.page === 'dashboard' && <Dashboard onMenu={onMenu} />}
        {route.page === 'missions' && <Missions onMenu={onMenu} />}
        {route.page === 'mission' && <MissionPage onMenu={onMenu} />}
        {route.page === 'clients' && <Clients onMenu={onMenu} />}
        {route.page === 'client' && <ClientPage onMenu={onMenu} />}
        {route.page === 'droits' && <Droits onMenu={onMenu} />}
        {route.page === 'parametrage' && <Parametrage onMenu={onMenu} />}
        {route.page === 'memento' && <Memento onMenu={onMenu} />}
        <StatusBar />
      </div>

      {wizard && <NewMissionWizard init={wizard} />}
    </div>
  )
}
