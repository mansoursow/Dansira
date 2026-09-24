import {
  LayoutGrid, FolderOpen, Building2, ShieldCheck, Settings, BookOpen, PlayCircle, X,
} from 'lucide-react'
import { cabinet } from '../data/cabinet'
import { useUi, type Page } from '../ui'

interface Item { id: string; label: string; icon: typeof LayoutGrid; page?: Page }

const nav: Item[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutGrid, page: 'dashboard' },
  { id: 'missions', label: 'Missions', icon: FolderOpen, page: 'missions' },
  { id: 'clients', label: 'Dossiers clients', icon: Building2 },
  { id: 'droits', label: 'Droits & utilisateurs', icon: ShieldCheck, page: 'droits' },
  { id: 'parametrage', label: 'Paramétrage', icon: Settings },
]

const ressources: Item[] = [
  { id: 'memento', label: 'Memento', icon: BookOpen, page: 'memento' },
  { id: 'tutoriel', label: 'Tutoriel', icon: PlayCircle },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { route, aller, soon } = useUi()

  const item = ({ id, label, icon: Icon, page }: Item) => (
    <button
      key={id}
      className={`nav-item ${page === (route.page === 'mission' ? 'missions' : route.page) ? 'is-active' : ''}`}
      onClick={() => { if (page) { aller(page); onClose() } else soon(label) }}
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
      {!page && <em className="nav-item__soon">bientôt</em>}
    </button>
  )

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar__brand">
        <img src="/logo-adoc.png" alt="ADOC" />
        <button className="sidebar__close" onClick={onClose} aria-label="Fermer le menu">
          <X size={18} />
        </button>
      </div>
      <div className="sidebar__app">
        <span className="sidebar__app-name">ADOC Audit</span>
        <span className="sidebar__app-sub">Ex. {cabinet.exercice} · {cabinet.referentiel}</span>
      </div>

      <nav className="sidebar__nav">
        {nav.map(item)}
        <div className="sidebar__section">Ressources</div>
        {ressources.map(item)}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__footer-label">{cabinet.nom}</div>
        <div className="sidebar__user">
          <span className="avatar">{cabinet.utilisateur.slice(0, 2)}</span>
          <div>
            <div className="sidebar__user-name">{cabinet.utilisateur}</div>
            <div className="sidebar__user-role">Poste : {cabinet.poste} · Administrateur</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
