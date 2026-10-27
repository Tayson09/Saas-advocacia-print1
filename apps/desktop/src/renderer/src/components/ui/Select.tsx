import './Select.css'
import { forwardRef, ReactNode, SelectHTMLAttributes, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import Label from './Label'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  options: SelectOption[]
  // texto exibido quando nada foi escolhido (vira uma option desabilitada)
  placeholder?: string
  leftIcon?: ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, required, options, placeholder, leftIcon, id, className, value, ...rest },
  ref
) {
  const autoId = useId()
  const selectId = id ?? autoId
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined

  return (
    <div className={['ui-field', className ?? ''].filter(Boolean).join(' ')}>
      {label && (
        <Label htmlFor={selectId} required={required}>
          {label}
        </Label>
      )}

      <div
        className={[
          'ui-select',
          error ? 'ui-select--error' : '',
          value ? '' : 'ui-select--placeholder'
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leftIcon && <span className="ui-select__icon">{leftIcon}</span>}
        <select
          ref={ref}
          id={selectId}
          className="ui-select__control"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={value}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="ui-select__chevron">
          <ChevronDown size={18} />
        </span>
      </div>

      {error ? (
        <span id={`${selectId}-error`} className="ui-field__error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${selectId}-hint`} className="ui-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  )
})

export default Select
