import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ModeCreation } from './store'

// Navigation par hash : #/missions, #/droits?tab=profils, #/memento#missions…
export type Page = 'dashboard' | 'missions' | 'mission' | 'droits' | 'memento'

export interface Route { page: Page; params: URLSearchParams }

function lireRoute(): Route {
  const [chemin, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?')
  const page = (['missions', 'mission', 'droits', 'memento'].includes(chemin) ? chemin : 'dashboard') as Page
  return { page, params: new URLSearchParams(query) }
}

export interface WizardInit { mode?: ModeCreation; sourceId?: string }

interface Ui {
  route: Route
  aller: (page: Page, params?: Record<string, string>) => void
  toast: (msg: string) => void
  soon: (label: string) => void
  ouvrirWizard: (init?: WizardInit) => void
  wizard: WizardInit | null
  fermerWizard: () => void
}

const Ctx = createContext<Ui | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(lireRoute)
  const [message, setMessage] = useState<string | null>(null)
  const [wizard, setWizard] = useState<WizardInit | null>(null)

  useEffect(() => {
    const onHash = () => { setRoute(lireRoute()); window.scrollTo(0, 0) }
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
