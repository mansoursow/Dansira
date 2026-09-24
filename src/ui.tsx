import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { ModeCreation } from './store'

// Navigation par hash : #/missions, #/droits?tab=profils, #/memento#missions…
export type Page = 'dashboard' | 'missions' | 'mission' | 'clients' | 'client' | 'droits' | 'parametrage' | 'memento'

export interface Route { page: Page; params: URLSearchParams }

function lireRoute(): Route {
  const [chemin, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?')
  const page = (['missions', 'mission', 'clients', 'client', 'droits', 'parametrage', 'memento'].includes(chemin) ? chemin : 'dashboard') as Page
  return { page, params: new URLSearchParams(query) }
}

export interface WizardInit { mode?: ModeCreation; sourceId?: string; clientId?: string }

interface Ui {
  route: Route
  aller: (page: Page, params?: Record<string, string>) => void
  toast: (msg: string) => void
  soon: (label: string) => void
  ouvrirWizard: (init?: WizardInit) => void
  wizard: WizardInit | null
  fermerWizard: () => void
  /** Retour à la page précédente de l'application (ou au tableau de bord). */
  retour: () => void
  peutRevenir: boolean
}

// Position dans l'historique propre à l'application : 0 = première page ouverte.
// Elle est mémorisée dans history.state pour ne jamais faire sortir du logiciel.
const lirePosition = (): number | undefined => (window.history.state as { pos?: number } | null)?.pos

const Ctx = createContext<Ui | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(lireRoute)
  const [message, setMessage] = useState<string | null>(null)
  const [wizard, setWizard] = useState<WizardInit | null>(null)
  const [position, setPosition] = useState(() => {
    const p = lirePosition() ?? 0
    window.history.replaceState({ ...window.history.state, pos: p }, '')
    return p
  })
  const positionRef = useRef(position)

  useEffect(() => {
    const onHash = () => {
      // Nouvelle entrée (lien, navigation interne) : on la numérote. Retour / avance : on relit sa position.
      let p = lirePosition()
      if (p === undefined) {
        p = positionRef.current + 1
        window.history.replaceState({ ...window.history.state, pos: p }, '')
      }
      positionRef.current = p
      setPosition(p)
      setRoute(lireRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 2800)
    return () => clearTimeout(t)
  }, [message])

  const aller = (page: Page, params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params)}` : ''
    window.location.hash = `/${page === 'dashboard' ? '' : page}${q}`
  }

  const value: Ui = {
    route,
    aller,
    toast: setMessage,
    soon: (label) => setMessage(`« ${label} » — module en cours de construction`),
    ouvrirWizard: (init = {}) => setWizard(init),
    wizard,
    fermerWizard: () => setWizard(null),
    peutRevenir: position > 0 || route.page !== 'dashboard',
    retour: () => (position > 0 ? window.history.back() : aller('dashboard')),
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      {message && <div className="toast" role="status">{message}</div>}
    </Ctx.Provider>
  )
}

export function useUi() {
  const u = useContext(Ctx)
  if (!u) throw new Error('useUi doit être utilisé dans <UiProvider>')
  return u
}
