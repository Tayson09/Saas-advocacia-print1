import './Checkbox.css'
import { InputHTMLAttributes, ReactNode, useId } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children: ReactNode
}

function Checkbox({ children, id, className, ...rest }: CheckboxProps): React.JSX.Element {
  const autoId = useId()
  const checkboxId = id ?? autoId

  return (
    <div className={['ui-checkbox', className ?? ''].filter(Boolean).join(' ')}>
      <input id={checkboxId} type="checkbox" className="ui-checkbox__input" {...rest} />
      <label htmlFor={checkboxId} className="ui-checkbox__label">
        {children}
      </label>
    </div>
  )
}

export default Checkbox
