import './Modal.css'
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

function Modal({ open, onClose, title, children }: ModalProps): React.JSX.Element | null {
  // fecha com a tecla Esc enquanto estiver aberto
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    // clique no fundo fecha; clique no conteúdo não propaga
    <div className="ui-modal__overlay" role="presentation" onClick={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ui-modal__header">
          {title && <h2 className="ui-modal__title">{title}</h2>}
          <button type="button" className="ui-modal__close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
