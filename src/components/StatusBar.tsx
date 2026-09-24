import { useEffect, useState } from 'react'
import { cabinet } from '../data/cabinet'

export default function StatusBar() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <footer className="statusbar">
      <span className={`dot ${online ? 'dot--ok' : 'dot--off'}`} /> Liaison internet
      <span className="dot dot--off" /> Liaison documents
      <span className="dot dot--ok" /> Sécurité globale
      <span className="sep" />
      <span>Poste : {cabinet.poste}</span>
      <span>{cabinet.signataire}</span>
      <span className="statusbar__right">
        Licence(s) : {cabinet.licences} <span className="mono">v{cabinet.version}</span>
      </span>
    </footer>
  )
}
