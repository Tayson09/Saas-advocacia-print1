import './Button.css'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
  // ícones opcionais nas pontas (lucide)
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

function Button({
  variant = 'primary',
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps): React.JSX.Element {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    fullWidth ? 'ui-button--full' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {leftIcon && <span className="ui-button__icon">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="ui-button__icon">{rightIcon}</span>}
    </button>
  )
}

export default Button
