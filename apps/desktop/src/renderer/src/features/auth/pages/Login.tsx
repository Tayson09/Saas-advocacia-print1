import './Login.css'
import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import Alert from '../../../components/ui/Alert'
import { ApiError } from '../../../lib/http'
import { login } from '../api'
import { useAuth } from '../context'
import { saveSession, saveRememberedEmail, clearRememberedEmail, getRememberedEmail } from '../session'
import { loginSchema } from '../validation'

type LoginFieldErrors = Partial<Record<'email' | 'password', string>>
type LoginField = 'email' | 'password'

// requisitos de senha, exibidos como instrução abaixo do campo
const passwordHint =
  'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'

// extrai a mensagem do primeiro erro de um campo específico
function fieldError(
  field: LoginField,
  values: { email: string; password: string }
): string | undefined {
  const result = loginSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

function Login(): React.JSX.Element {
  const navigate = useNavigate()
  const { setUser, isAuthenticated } = useAuth()

  const [email, setEmail] = useState(() => getRememberedEmail())
  const [password, setPassword] = useState('')
  const [rememberEmail, setRememberEmail] = useState(() => Boolean(getRememberedEmail()))
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setError('')

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const nextErrors: LoginFieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginFieldErrors
        if (field && !nextErrors[field]) nextErrors[field] = issue.message
      }
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setLoading(true)
    try {
      const data = await login(result.data)

      saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshRawToken,
        user: data.user
      })

      if (rememberEmail) {
        saveRememberedEmail(email)
      } else {
        clearRememberedEmail()
      }

      setUser(data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'USER_ACCOUNT_DISABLED') {
        setError('Sua conta está inativa. Entre em contato com o administrador do sistema.')
      } else {
        setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      }
    } finally {
      setLoading(false)
    }
  }

  // valida um campo ao sair dele, mostrando a mensagem quando é deixado vazio
  function handleBlur(field: LoginField): void {
    setFieldErrors((prev) => ({ ...prev, [field]: fieldError(field, { email, password }) }))
  }

  return (
    <AuthLayout>
      <div className="login">
        <PageIntro
          label="ACESSO AO SISTEMA"
          title="Acesse sua conta"
          description="Use seu e-mail e senha para continuar"
        />

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }}
            onBlur={() => handleBlur('email')}
            error={fieldErrors.email}
            placeholder="seuemail@gmail.com"
            autoComplete="username"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setFieldErrors((prev) => ({ ...prev, password: undefined }))
            }}
            onBlur={() => handleBlur('password')}
            error={fieldErrors.password}
            hint={passwordHint}
            placeholder="Sua senha"
            autoComplete="current-password"
          />

          <div className="login__preferences">
            <Checkbox
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
            >
              Lembrar meu e-mail
            </Checkbox>
            <a className="login__recover" href="#" onClick={(e) => e.preventDefault()}>
              Esqueci minha senha
            </a>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" fullWidth disabled={loading} rightIcon={<ArrowRight size={16} />}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="login__first-access">
          <div className="login__first-access-intro">
            <strong className="login__first-access-title">Primeiro acesso?</strong>
            <p className="login__first-access-text">
              Configure o primeiro administrador. Se já existe uma conta no sistema, peça acesso ao
              administrador.
            </p>
          </div>
          <Button
            variant="secondary"
            fullWidth
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate('/cadastro-admin')}
          >
            Cadastrar administrador
          </Button>
        </div>

        <p className="login__security-note">
          <LockKeyhole size={13} />
          Seu acesso é pessoal. Não compartilhe sua senha.
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
