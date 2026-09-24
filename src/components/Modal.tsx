import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  titre: ReactNode
  sousTitre?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  large?: boolean
}

export default function Modal({ titre, sousTitre, onClose, children, footer, large }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="modal-layer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${large ? 'modal--large' : ''}`} role="dialog" aria-modal="true">
        <header className="modal__head">
          <div>
            <h2>{titre}</h2>
            {sousTitre && <div className="modal__sub">{sousTitre}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
