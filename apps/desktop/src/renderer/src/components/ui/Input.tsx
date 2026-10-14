import './Input.css'
import { forwardRef, InputHTMLAttributes, ReactNode, useId, useState } from 'react'
import { Check, Eye, EyeOff } from 'lucide-react'
import Label from './Label'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  required?: boolean
  // exibe um check verde à direita quando o campo está válido
  valid?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, required, valid, id, type = 'text', className, ...rest },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [showPassword, setShowPassword] = useState(false)

  // alterna a visibilidade quando o campo é de senha
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type

  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={['ui-field', className ?? ''].filter(Boolean).join(' ')}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}

      <div className={['ui-input', error ? 'ui-input--error' : ''].filter(Boolean).join(' ')}>
        {leftIcon && <span className="ui-input__icon">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className="ui-input__control"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="ui-input__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {!isPassword && valid && (
          <span className="ui-input__valid">
            <Check size={18} />
          </span>
        )}
      </div>

      {error ? (
        <span id={`${inputId}-error`} className="ui-field__error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="ui-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  )
})

export default Input
