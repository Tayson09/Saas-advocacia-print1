import './CompletarCadastro.css'
import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import PasswordStrength from '../components/PasswordStrength'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { useToast } from '../../../components/ui/Toast'
import { ApiError } from '../../../lib/http'
import { completePasswordSetup } from '../api'
import { completeSetupSchema } from '../validation'

type FieldErrors = Partial<Record<'password' | 'confirmPassword', string>>
type Field = keyof FieldErrors

interface FormValues {
  password: string
  confirmPassword: string
}

// extrai a mensagem (pt-br) do primeiro erro de um campo específico
function fieldError(field: Field, values: FormValues): string | undefined {
  const result = completeSetupSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

function CompletarCadastro(): React.JSX.Element {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const values: FormValues = { password, confirmPassword }

  // link sem token não tem como prosseguir: mostra orientação em vez do formulário
  if (!token) {
    return (
      <AuthLayout>
        <div className="completar">
          <PageIntro
            label="DEFINIR SENHA"
            title="Link inválido"
            description="Este link de configuração de senha está incompleto ou inválido."
          />
          <Alert variant="danger" title="Não foi possível abrir o convite">
            Abra o sistema a partir do link enviado para o seu e-mail. Se o problema persistir, peça
            ao administrador para reenviar o convite.
          </Alert>
          <Button fullWidth onClick={() => navigate('/login')} rightIcon={<ArrowRight size={16} />}>
            Ir para o login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSubmitError('')

    const result = completeSetupSchema.safeParse(values)
    if (!result.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field
        if (field && !nextErrors[field]) nextErrors[field] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      await completePasswordSetup({ token, password: result.data.password })
      toast.success('Senha definida com sucesso! Faça login para acessar o sistema.', {
        title: 'Tudo certo'
      })
      navigate('/login', { replace: true })
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  function handleApiError(err: unknown): void {
    if (err instanceof ApiError) {
      // token inválido/expirado/já usado: o link não serve mais
      if (err.code === 'INVALID_PASSWORD_SETUP_TOKEN') {
        const message =
          'Este link expirou ou já foi utilizado. Peça ao administrador para reenviar o convite.'
        setSubmitError(message)
        toast.error(message, { title: 'Link expirado' })
        return
      }

      if (err.code === 'VALIDATION_ERROR' && err.details) {
        const nextErrors: FieldErrors = {}
        for (const detail of err.details) {
          const field = detail.path as Field
          if (field && !nextErrors[field]) nextErrors[field] = detail.message
        }
        setErrors(nextErrors)
        return
      }

      setSubmitError(err.message)
      toast.error(err.message, { title: 'Não foi possível definir a senha' })
      return
    }

    const fallback = 'Não foi possível definir a senha.'
    setSubmitError(fallback)
    toast.error(fallback)
  }

  // mostra o erro do campo ao sair dele (primeiro blur)
  function handleBlur(field: Field): void {
    setErrors((prev) => ({ ...prev, [field]: fieldError(field, values) }))
  }

  // reavalia em tempo real quando faz sentido avisar (campo tocado ou confirmação já digitada)
  function revalidate(field: Field, nextValues: FormValues): void {
    setErrors((prev) => {
      const shouldShow =
        prev[field] !== undefined ||
        (field === 'confirmPassword' && nextValues.confirmPassword.length > 0)
      if (!shouldShow) return prev
      return { ...prev, [field]: fieldError(field, nextValues) }
    })
  }

  return (
    <AuthLayout>
      <div className="completar">
        <PageIntro
          label="DEFINIR SENHA"
          title="Crie sua senha de acesso"
          description="Escolha uma senha para ativar sua conta e acessar o sistema."
        />

        <Alert variant="info" title="Quase lá">
          Após definir a senha, use seu e-mail e a senha criada para entrar no sistema.
        </Alert>

        <form className="completar__form" onSubmit={handleSubmit} noValidate>
          <div className="completar__password">
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => {
                const next = e.target.value
                setPassword(next)
                const nextValues = { ...values, password: next }
                revalidate('password', nextValues)
                // confirmação cruza com a senha: reavalia junto
                revalidate('confirmPassword', nextValues)
              }}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              placeholder="Crie uma senha"
              autoComplete="new-password"
            />
            <PasswordStrength value={password} />
          </div>

          <Input
            label="Confirme sua senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              const next = e.target.value
              setConfirmPassword(next)
              revalidate('confirmPassword', { ...values, confirmPassword: next })
            }}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Repita a senha"
            autoComplete="new-password"
          />

          {submitError && <Alert variant="danger">{submitError}</Alert>}

          <Button type="submit" fullWidth disabled={loading} rightIcon={<ArrowRight size={16} />}>
            {loading ? 'Salvando...' : 'Definir senha e ativar conta'}
          </Button>
        </form>

        <p className="completar__security-note">
          <LockKeyhole size={13} />
          Sua senha é pessoal. Não a compartilhe com ninguém.
        </p>
      </div>
    </AuthLayout>
  )
}

export default CompletarCadastro
