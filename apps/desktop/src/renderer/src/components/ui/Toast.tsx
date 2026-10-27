import './Toast.css'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'danger' | 'info'

interface ToastItem {
  id: number
  variant: ToastVariant
  title?: string
  message: string
  duration: number
}

interface ToastOptions {
  title?: string
  // tempo (ms) até o fechamento automático; 0 mantém fixo até fechar manualmente
  duration?: number
}

interface ToastContextValue {
  notify: (variant: ToastVariant, message: string, options?: ToastOptions) => number
  success: (message: string, options?: ToastOptions) => number
  error: (message: string, options?: ToastOptions) => number
  info: (message: string, options?: ToastOptions) => number
  dismiss: (id: number) => void
}

const DEFAULT_DURATION = 5000

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  danger: AlertCircle,
  info: Info
}

export function ToastProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  // contador incremental garante ids únicos mesmo com toasts simultâneos
  const nextId = useRef(1)

  const dismiss = useCallback((id: number): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions): number => {
      const id = nextId.current++
      const duration = options?.duration ?? DEFAULT_DURATION
      setToasts((prev) => [...prev, { id, variant, message, title: options?.title, duration }])
      return id
    },
    []
  )

  const success = useCallback(
    (message: string, options?: ToastOptions) => notify('success', message, options),
    [notify]
  )
  const error = useCallback(
    (message: string, options?: ToastOptions) => notify('danger', message, options),
    [notify]
  )
  const info = useCallback(
    (message: string, options?: ToastOptions) => notify('info', message, options),
    [notify]
  )

  return (
    <ToastContext.Provider value={{ notify, success, error, info, dismiss }}>
      {children}
      <div className="ui-toast__viewport" role="region" aria-label="Notificações" aria-live="polite">
        {toasts.map((toast) => (
          <ToastView key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

interface ToastViewProps {
  toast: ToastItem
  onDismiss: (id: number) => void
}

function ToastView({ toast, onDismiss }: ToastViewProps): React.JSX.Element {
  const Icon = icons[toast.variant]
  const [leaving, setLeaving] = useState(false)

  // fecha com uma pequena animação de saída antes de remover da lista
  const close = useCallback((): void => {
    setLeaving(true)
    window.setTimeout(() => onDismiss(toast.id), 180)
  }, [onDismiss, toast.id])

  useEffect(() => {
    if (toast.duration <= 0) return
    const timer = window.setTimeout(close, toast.duration)
    return () => window.clearTimeout(timer)
  }, [toast.duration, close])

  return (
    <div
      className={[
        'ui-toast',
        `ui-toast--${toast.variant}`,
        leaving ? 'ui-toast--leaving' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <span className="ui-toast__icon">
        <Icon size={18} />
      </span>
      <div className="ui-toast__content">
        {toast.title && <strong className="ui-toast__title">{toast.title}</strong>}
        <div className="ui-toast__message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="ui-toast__close"
        onClick={close}
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
