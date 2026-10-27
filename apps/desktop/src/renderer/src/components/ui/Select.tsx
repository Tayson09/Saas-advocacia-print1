import './Select.css'
import { ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  options: SelectOption[]
  // texto exibido quando nada foi escolhido
  placeholder?: string
  value: string
  onChange: (value: string) => void
  // chamado quando o foco sai do componente (usado para validação no blur)
  onBlur?: () => void
  leftIcon?: ReactNode
  id?: string
  className?: string
}

// caixa de seleção customizada (combobox) — substitui o <select> nativo para
// manter a identidade visual do sistema e um dropdown estilizado
function Select({
  label,
  error,
  hint,
  required,
  options,
  placeholder = 'Selecione',
  value,
  onChange,
  onBlur,
  leftIcon,
  id,
  className
}: SelectProps): React.JSX.Element {
  const autoId = useId()
  const selectId = id ?? autoId
  const labelId = `${selectId}-label`
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined

  function close(): void {
    setOpen(false)
    setActiveIndex(-1)
  }

  function openList(): void {
    setOpen(true)
    const current = options.findIndex((o) => o.value === value)
    setActiveIndex(current >= 0 ? current : 0)
  }

  function choose(next: string): void {
    onChange(next)
    close()
    onBlur?.()
  }

  // fecha ao clicar fora e avisa o blur para a validação
  useEffect(() => {
    if (!open) return
    function onDocPointerDown(event: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close()
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', onDocPointerDown)
    return () => document.removeEventListener('mousedown', onDocPointerDown)
  }, [open, onBlur])

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>): void {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        openList()
      }
      return
    }
    if (event.key === 'Escape' || event.key === 'Tab') {
      close()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(options.length - 1, i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (activeIndex >= 0) choose(options[activeIndex].value)
    }
  }

  return (
    <div className={['ui-field', className ?? ''].filter(Boolean).join(' ')} ref={rootRef}>
      {label && (
        <span className="ui-label" id={labelId}>
          {label}
          {required && <span className="ui-label__required"> *</span>}
        </span>
      )}

      <div className="ui-select__wrapper">
        <button
          type="button"
          id={selectId}
          className={[
            'ui-select',
            error ? 'ui-select--error' : '',
            selected ? '' : 'ui-select--placeholder',
            open ? 'ui-select--open' : ''
          ]
            .filter(Boolean)
            .join(' ')}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          onClick={() => (open ? close() : openList())}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // blur real (não ao abrir a lista): dispara validação
            if (!open) onBlur?.()
          }}
        >
          {leftIcon && <span className="ui-select__icon">{leftIcon}</span>}
          <span className="ui-select__value">{selected ? selected.label : placeholder}</span>
          <ChevronDown size={18} className="ui-select__chevron" />
        </button>

        {open && (
          <ul className="ui-select__list" role="listbox" aria-labelledby={label ? labelId : undefined}>
            {options.map((option, index) => {
              const isSelected = option.value === value
              const isActive = index === activeIndex
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    'ui-select__option',
                    isActive ? 'ui-select__option--active' : '',
                    isSelected ? 'ui-select__option--selected' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => setActiveIndex(index)}
                  // evita o blur do botão antes do clique registrar a escolha
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} />}
                </li>
              )
            })}
          </ul>
        )}
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
}

export default Select
