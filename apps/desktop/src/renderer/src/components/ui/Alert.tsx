import './Alert.css'
import { ReactNode } from 'react'
import { Info, CheckCircle2, AlertCircle } from 'lucide-react'

type Variant = 'info' | 'success' | 'danger'

interface AlertProps {
  variant?: Variant
  title?: string
  children?: ReactNode
}

const icons = {
  info: Info,
  success: CheckCircle2,
  danger: AlertCircle
}

function Alert({ variant = 'info', title, children }: AlertProps): React.JSX.Element {
  const Icon = icons[variant]

  return (
    <div className={`ui-alert ui-alert--${variant}`} role="alert">
      <span className="ui-alert__icon">
        <Icon size={18} />
      </span>
      <div className="ui-alert__content">
        {title && <strong className="ui-alert__title">{title}</strong>}
        {children && <div className="ui-alert__body">{children}</div>}
      </div>
    </div>
  )
}

export default Alert
