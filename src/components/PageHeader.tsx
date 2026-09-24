import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'

interface Props {
  titre: string
  sousTitre: ReactNode
  actions?: ReactNode
  avant?: ReactNode // ex. lien de retour au-dessus du titre
  onMenu: () => void
}

export default function PageHeader({ titre, sousTitre, actions, avant, onMenu }: Props) {
  return (
    <header className="topbar">
      <button className="topbar__menu" onClick={onMenu} aria-label="Ouvrir le menu">
        <Menu size={20} />
      </button>
      <div className="topbar__titles">
        {avant}
        <h1>{titre}</h1>
        <div className="topbar__sub">{sousTitre}</div>
      </div>
      {actions && <div className="topbar__actions">{actions}</div>}
    </header>
  )
}
