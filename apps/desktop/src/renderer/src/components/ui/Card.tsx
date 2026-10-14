import './Card.css'
import { HTMLAttributes } from 'react'

function Card({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={['ui-card', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

export default Card
