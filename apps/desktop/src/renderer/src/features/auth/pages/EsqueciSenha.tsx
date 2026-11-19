import './CompletarCadastro.css'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import { useToast } from '../../../components/ui/Toast'
import { forgotPassword } from '../api'
import { forgotPasswordSchema } from '../validation'

function EsqueciSenha(): React.JSX.Element {
  const navigate = useNavigate()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  // após o envio, trocamos o formulário por uma confirmação (sem revelar se o e-mail existe)
  const [submitted, setSubmitted] = useState(false)

  function validateEmail(): string | undefined {
    const result = forgotPasswordSchema.safeParse({ email })
    if (result.success) return undefined
    return result.error.issues.find((issue) => issue.path[0] === 'email')?.message
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setEmailError(result.error.issues.find((issue) => issue.path[0] === 'email')?.message)
      return
    }

    setEmailError(undefined)
    setLoading(true)
    try {
      await forgotPassword(result.data.email)
      setSubmitted(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível concluir a solicitação.'
      toast.error(message, { title: 'Falha na solicitação' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="completar">
          <PageIntro
            label="REDEFINIR SENHA"
            title="Verifique seu e-mail"
            description="Se houver uma conta associada a esse e-mail, enviaremos um link para redefinir a senha."
          />

          <Alert variant="success" title="Solicitação enviada">
            O link é válido por <strong>1 hora</strong> e só pode ser usado uma vez. Não esqueça de
            olhar a caixa de spam.
          </Alert>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Voltar para o login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="completar">
        <PageIntro
          label="REDEFINIR SENHA"
          title="Esqueceu sua senha?"
          description="Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha."
        />

        <form className="completar__form" onSubmit={handleSubmit} noValidate>
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError(undefined)
            }}
            onBlur={() => setEmailError(validateEmail())}
            error={emailError}
            placeholder="seuemail@gmail.com"
            autoComplete="username"
          />

          <Button type="submit" fullWidth disabled={loading} rightIcon={<MailCheck size={16} />}>
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </Button>
        </form>

        <Button
          variant="secondary"
          fullWidth
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/login')}
        >
          Voltar para o login
        </Button>
      </div>
    </AuthLayout>
  )
}

export default EsqueciSenha
