import './Login.css'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import Alert from '../../../components/ui/Alert'
import { login } from '../api'

function Login(): React.JSX.Element {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      // TODO(RF01): stub de login — backend ainda não expõe autenticação
      await login({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="login">
        <PageIntro
          label="ACESSO AO SISTEMA"
          title="Acesse sua conta"
          description="Use seu e-mail institucional e senha para continuar"
        />

        <form className="login__form" onSubmit={handleSubmit}>
          <Input
            label="E-mail institucional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@instituicao.com.br"
            autoComplete="username"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
          />

          <div className="login__preferences">
            <Checkbox>Lembrar meu e-mail</Checkbox>
            <a className="login__recover" href="#" onClick={(e) => e.preventDefault()}>
              Esqueci minha senha
            </a>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" fullWidth disabled={loading} rightIcon={<ArrowRight size={16} />}>
            Entrar
          </Button>
        </form>

        <div className="login__first-access">
          <div className="login__first-access-intro">
            <strong className="login__first-access-title">Primeiro acesso?</strong>
            <p className="login__first-access-text">
              Configure o primeiro administrador. Se sua instituição já usa o sistema, peça acesso
              ao administrador.
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
