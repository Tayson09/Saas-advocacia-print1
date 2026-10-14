import './Label.css'
import { LabelHTMLAttributes } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

function Label({ required = false, children, className, ...rest }: LabelProps): React.JSX.Element {
  return (
    <label className={['ui-label', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {children}
      {required && <span className="ui-label__required"> *</span>}
    </label>
  )
}

export default Label
