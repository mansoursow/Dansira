import { useEffect, useRef, useState } from 'react'
import { Check, User, Settings, ChevronDown } from 'lucide-react'
import { useUi } from '../ui'

type Action = { label: string; run: () => void }

export default function ActionTiles() {
  const { aller, ouvrirWizard } = useUi()
  const [openId, setOpenId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const tiles: { id: string; label: string; icon: typeof Check; ouvrir: () => void; actions: Action[] }[] = [
    {
      id: 'missions', label: 'Missions', icon: Check, ouvrir: () => aller('missions'),
      actions: [
        { label: 'Nouvelle mission vierge', run: () => ouvrirWizard({ mode: 'vierge' }) },
        { label: 'Cloner une mission', run: () => ouvrirWizard({ mode: 'clone' }) },
        { label: "Reprise de l'arrêté N → N+1", run: () => ouvrirWizard({ mode: 'report' }) },
        { label: 'Ouvrir une mission', run: () => aller('missions') },
        { label: 'Missions clôturées', run: () => aller('missions', { statut: 'cloturee' }) },
      ],
    },
    {
      id: 'droits', label: 'Droits', icon: User, ouvrir: () => aller('droits'),
      actions: [
        { label: 'Collaborateurs', run: () => aller('droits', { tab: 'collaborateurs' }) },
        { label: 'Profils & habilitations', run: () => aller('droits', { tab: 'profils' }) },
        { label: 'Affectations aux missions', run: () => aller('droits', { tab: 'affectations' }) },
      ],
    },
    {
      id: 'parametrage', label: 'Paramétrage', icon: Settings, ouvrir: () => aller('parametrage'),
      actions: [
        { label: 'Informations du cabinet', run: () => aller('parametrage', { tab: 'cabinet' }) },
        { label: 'Plan comptable SYSCOHADA', run: () => aller('parametrage', { tab: 'plan' }) },
        { label: 'Modèles de documents', run: () => aller('parametrage', { tab: 'modeles' }) },
        { label: 'Dossiers clients', run: () => aller('clients') },
      ],
    },
  ]

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="tiles" ref={ref}>
      {tiles.map(({ id, label, icon: Icon, ouvrir, actions }) => (
        <div key={id} className={`tile ${openId === id ? 'is-open' : ''}`}>
          <button className="tile__main" onClick={ouvrir}>
            <Icon className="tile__icon" size={26} strokeWidth={2.4} />
            <span className="tile__label">{label}</span>
          </button>
          <button
            className="tile__toggle"
            aria-label={`Actions ${label}`}
            aria-expanded={openId === id}
            onClick={() => setOpenId(openId === id ? null : id)}
          >
            <ChevronDown size={18} />
          </button>
          {openId === id && (
            <ul className="tile__menu" role="menu">
              {actions.map((a) => (
                <li key={a.label}>
                  <button role="menuitem" onClick={() => { setOpenId(null); a.run() }}>{a.label}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
