import './PasswordStrength.css'
import { Check } from 'lucide-react'
import { passwordRequirements, passwordScore } from '../validation'

interface PasswordStrengthProps {
  value: string
}

// medidor de força (4 segmentos) + lista de requisitos, dirigidos pelo score 0..5
function PasswordStrength({ value }: PasswordStrengthProps): React.JSX.Element {
  const score = passwordScore(value)
  // 5 critérios mapeados em 4 segmentos do medidor
  const filledSegments = value.length === 0 ? 0 : Math.max(1, Math.round((score / 5) * 4))

  let level: 'weak' | 'medium' | 'strong' = 'weak'
  let label = 'Senha fraca'
  if (score >= 5) {
    level = 'strong'
    label = 'Senha forte'
  } else if (score >= 3) {
    level = 'medium'
    label = 'Senha média'
  }

  return (
    <div className="password-strength">
      <div className="password-strength__meter">
        <div className="password-strength__segments">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={[
                'password-strength__segment',
                i < filledSegments ? `password-strength__segment--${level}` : ''
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
        {value.length > 0 && (
          <span className={`password-strength__label password-strength__label--${level}`}>
            {label}
          </span>
        )}
      </div>

      <p className="password-strength__hint">A senha deve conter:</p>
      <ul className="password-strength__requirements">
        {passwordRequirements.map((req) => {
          const ok = req.test(value)
          return (
            <li
              key={req.key}
              className={[
                'password-strength__requirement',
                ok ? 'password-strength__requirement--ok' : ''
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Check size={12} />
              {req.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PasswordStrength
