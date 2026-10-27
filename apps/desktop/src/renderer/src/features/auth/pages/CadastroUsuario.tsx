import './CadastroUsuario.css'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { useToast } from '../../../components/ui/Toast'
import { ApiError } from '../../../lib/http'
import { registerUser } from '../api'
import { registerUserSchema, roleOptions, isValidName } from '../validation'

type FieldErrors = Partial<Record<'name' | 'email' | 'role', string>>
type Field = keyof FieldErrors

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormValues {
  name: string
  email: string
  role: string
}

// extrai a mensagem (pt-br, vinda do schema) do primeiro erro de um campo
function fieldError(field: Field, values: FormValues): string | undefined {
  const result = registerUserSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

function CadastroUsuario(): React.JSX.Element {
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const values: FormValues = { name, email, role }

  function resetForm(): void {
    setName('')
    setEmail('')
    setRole('')
    setErrors({})
    setSubmitError('')
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSubmitError('')

    const result = registerUserSchema.safeParse(values)
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
      const { user, emailSent } = await registerUser({
        name: result.data.name,
        email: result.data.email,
        role: result.data.role
      })

      if (emailSent) {
        toast.success(
          `${user.name} foi cadastrado(a). Um e-mail com o link para definir a senha foi enviado para ${user.email}.`,
          { title: 'Usuário cadastrado' }
        )
      } else {
        // conta criada, mas o convite não saiu: avisa que é preciso reenviar
        toast.info(
          `${user.name} foi cadastrado(a), mas não foi possível enviar o e-mail de convite. Verifique o endereço e tente reenviar o convite.`,
          { title: 'Cadastro realizado — e-mail não enviado', duration: 9000 }
        )
      }

      resetForm()
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  function handleApiError(err: unknown): void {
    if (err instanceof ApiError) {
      // e-mail duplicado: destaca o campo em vez de um erro genérico
      if (err.code === 'EMAIL_ALREADY_EXISTS' || err.code === 'UNIQUE_CONSTRAINT') {
        const message = 'Este e-mail já está cadastrado'
        setErrors((prev) => ({ ...prev, email: message }))
        toast.error(message, { title: 'Não foi possível cadastrar' })
        return
      }

      // admin perdeu permissão (ou não é admin): manda de volta ao painel
      if (err.code === 'FORBIDDEN' || err.code === 'UNAUTHENTICATED') {
        toast.error('Você não tem permissão para cadastrar usuários.', {
          title: 'Acesso negado'
        })
        navigate('/dashboard', { replace: true })
        return
      }

      // erros de validação devolvidos pela API mapeados para os campos
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        const nextErrors: FieldErrors = {}
        for (const detail of err.details) {
          const field = detail.path as Field
          if (field && !nextErrors[field]) nextErrors[field] = detail.message
        }
        setErrors(nextErrors)
        setSubmitError('Revise os campos destacados e tente novamente.')
        return
      }

      setSubmitError(err.message)
      toast.error(err.message, { title: 'Não foi possível cadastrar' })
      return
    }

    const fallback = 'Não foi possível concluir o cadastro.'
    setSubmitError(fallback)
    toast.error(fallback)
  }

  // mostra o erro do campo ao sair dele (primeiro blur)
  function handleBlur(field: Field): void {
    setErrors((prev) => ({ ...prev, [field]: fieldError(field, values) }))
  }

  // reavalia o erro em tempo real apenas quando o campo já está "tocado"
  function revalidate(field: Field, nextValues: FormValues): void {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev
      return { ...prev, [field]: fieldError(field, nextValues) }
    })
  }

  const nameValid = isValidName(name)
  const emailValid = emailPattern.test(email.trim())

  return (
    <AuthLayout>
      <div className="cadastro-usuario">
        <button
          type="button"
          className="cadastro-usuario__back"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} />
          Voltar ao painel
        </button>

        <PageIntro
          label="GESTÃO DE USUÁRIOS"
          title="Cadastrar usuário"
          description="Adicione um advogado ou secretário à equipe. Ele receberá um e-mail para definir a própria senha."
        />

        <Alert variant="info" title="Como funciona o acesso">
          Você não define a senha do usuário. Após o cadastro, ele recebe um link por e-mail (válido
          por 1 hora) para criar a senha e acessar o sistema.
        </Alert>

        <form className="cadastro-usuario__form" onSubmit={handleSubmit} noValidate>
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
            placeholder="Nome completo do usuário"
            autoComplete="off"
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
            placeholder="usuario@escritorio.com"
            autoComplete="off"
          />

          <Select
            label="Perfil de acesso"
            options={roleOptions}
            placeholder="Selecione o perfil"
            value={role}
            onChange={(e) => {
              const next = e.target.value
              setRole(next)
              revalidate('role', { ...values, role: next })
            }}
            onBlur={() => handleBlur('role')}
            error={errors.role}
            hint="Advogado acessa processos e clientes; Secretário auxilia na organização."
          />

          {submitError && <Alert variant="danger">{submitError}</Alert>}

          <div className="cadastro-usuario__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              rightIcon={<UserPlus size={16} />}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar usuário'}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default CadastroUsuario
