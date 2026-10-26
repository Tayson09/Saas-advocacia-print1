import './CadastroAdmin.css'
import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import PasswordStrength from '../components/PasswordStrength'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import Alert from '../../../components/ui/Alert'
import { ApiError } from '../../../lib/http'
import { getSetupStatus, registerAdmin } from '../api'
import { registerAdminSchema, isValidName } from '../validation'

type FieldErrors = Partial<
  Record<'name' | 'email' | 'password' | 'confirmPassword' | 'consent', string>
>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
  consent: boolean
}

// extrai a mensagem (pt-br, vinda do schema) do primeiro erro de um campo específico
function fieldError(field: keyof FieldErrors, values: FormValues): string | undefined {
  const result = registerAdminSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

function CadastroAdmin(): React.JSX.Element {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  // se o cadastro inicial já foi feito, redireciona para a tela de bloqueio
  useEffect(() => {
    let active = true
    getSetupStatus()
      .then((status) => {
        if (active && !status.registrationOpen) {
          navigate('/autocadastro-bloqueado', { replace: true })
        }
      })
      .catch(() => {
        // falha ao consultar o status não impede a tentativa de cadastro
      })
      .finally(() => {
        if (active) setChecking(false)
      })
    return () => {
      active = false
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSubmitError('')

    const result = registerAdminSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      consent
    })

    if (!result.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (field && !nextErrors[field]) nextErrors[field] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      const admin = await registerAdmin({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password
      })
      navigate('/cadastro-concluido', {
        replace: true,
        state: { name: admin.name, email: admin.email, role: admin.role }
      })
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  function handleApiError(err: unknown): void {
    if (err instanceof ApiError) {
      if (err.code === 'REGISTRATION_CLOSED') {
        navigate('/autocadastro-bloqueado', { replace: true })
        return
      }
      if (err.code === 'UNIQUE_CONSTRAINT') {
        setErrors((prev) => ({ ...prev, email: 'Este e-mail já está cadastrado' }))
        return
      }
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        const nextErrors: FieldErrors = {}
        for (const detail of err.details) {
          const field = detail.path as keyof FieldErrors
          if (field && !nextErrors[field]) nextErrors[field] = detail.message
        }
        setErrors(nextErrors)
        return
      }
      setSubmitError(err.message)
      return
    }
    setSubmitError('Não foi possível concluir o cadastro.')
  }

  const values: FormValues = { name, email, password, confirmPassword, consent }

  // mostra o erro do campo ao sair dele (primeiro blur)
  function handleBlur(field: keyof FieldErrors): void {
    setErrors((prev) => ({ ...prev, [field]: fieldError(field, values) }))
  }

  // reavalia o erro de um campo em tempo real quando faz sentido avisar:
  // - se o erro já está visível (campo já tocado), mantém atualizado ao digitar;
  // - se é a confirmação de senha e já há algo digitado, avisa a divergência
  //   enquanto o usuário digita, sem esperar o blur ou o envio.
  function revalidate(field: keyof FieldErrors, nextValues: FormValues): void {
    setErrors((prev) => {
      const shouldShow =
        prev[field] !== undefined ||
        (field === 'confirmPassword' && nextValues.confirmPassword.length > 0)
      if (!shouldShow) return prev
      return { ...prev, [field]: fieldError(field, nextValues) }
    })
  }

  if (checking) {
    return (
      <AuthLayout>
        <p className="cadastro__checking">Verificando disponibilidade do cadastro…</p>
      </AuthLayout>
    )
  }

  const nameValid = isValidName(name)
  const emailValid = emailPattern.test(email.trim())

  return (
    <AuthLayout>
      <div className="cadastro">
        <PageIntro
          label="SISTEMA ACADÊMICO"
          title="Cadastro do administrador"
          description="Preencha os dados abaixo para criar a primeira conta administrativa do sistema."
        />

        <Alert variant="info" title="Cadastro exclusivo do primeiro administrador">
          Depois deste cadastro, novos usuários serão adicionados pelo administrador do sistema.
        </Alert>

        <form className="cadastro__form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Nome completo"
            value={name}
            onChange={(e) => {
              const next = e.target.value
              setName(next)
              revalidate('name', { ...values, name: next })
            }}
            onBlur={() => handleBlur('name')}
            valid={nameValid}
            error={errors.name}
            placeholder="Seu nome completo"
            autoComplete="name"
          />

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => {
              const next = e.target.value
              setEmail(next)
              revalidate('email', { ...values, email: next })
            }}
            onBlur={() => handleBlur('email')}
            valid={emailValid}
            error={errors.email}
            placeholder="seuemail@gmail.com"
            autoComplete="email"
          />

          <div className="cadastro__password">
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => {
                const next = e.target.value
                setPassword(next)
                const nextValues = { ...values, password: next }
                revalidate('password', nextValues)
                // confirmação cruza com a senha: reavalia junto para não travar em "não coincidem"
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

          <Checkbox
            checked={consent}
            onChange={(e) => {
              const next = e.target.checked
              setConsent(next)
              revalidate('consent', { ...values, consent: next })
            }}
          >
            Ao criar sua conta, você concorda com os{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Termos de uso
            </a>{' '}
            e a{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Política de privacidade
            </a>
            .
          </Checkbox>
          {errors.consent && <span className="cadastro__consent-error">{errors.consent}</span>}

          {submitError && <Alert variant="danger">{submitError}</Alert>}

          <Button type="submit" fullWidth disabled={loading} rightIcon={<ArrowRight size={16} />}>
            Criar conta do administrador
          </Button>
        </form>

        <p className="cadastro__return">
          Já tem uma conta?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate('/login')
            }}
          >
            Entrar
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export default CadastroAdmin
