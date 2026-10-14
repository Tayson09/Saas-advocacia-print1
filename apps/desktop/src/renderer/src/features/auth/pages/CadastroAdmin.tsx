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
import { registerAdminSchema } from '../validation'

type FieldErrors = Partial<
  Record<'name' | 'email' | 'password' | 'confirmPassword' | 'consent', string>
>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  if (checking) {
    return (
      <AuthLayout>
        <p className="cadastro__checking">Verificando disponibilidade do cadastro…</p>
      </AuthLayout>
    )
  }

  const nameValid = name.trim().length >= 2
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
            onChange={(e) => setName(e.target.value)}
            valid={nameValid}
            error={errors.name}
            placeholder="Seu nome completo"
            autoComplete="name"
          />

          <Input
            label="E-mail institucional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            valid={emailValid}
            error={errors.email}
            placeholder="nome@instituicao.com.br"
            autoComplete="email"
          />

          <div className="cadastro__password">
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="Repita a senha"
            autoComplete="new-password"
          />

          <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)}>
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
