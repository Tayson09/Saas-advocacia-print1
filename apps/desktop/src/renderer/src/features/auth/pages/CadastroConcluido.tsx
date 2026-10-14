import './CadastroConcluido.css'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'

interface ConfirmationState {
  name: string
  email: string
  role?: string
}

// gera as iniciais a partir do nome (até duas letras)
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// rótulos dos papéis do enum UserRole da API
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  LAWYER: 'Advogado',
  SECRETARY: 'Secretário'
}

function roleLabel(role?: string): string {
  return (role && roleLabels[role]) || 'Administrador'
}

function CadastroConcluido(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ConfirmationState | null

  // a tela só faz sentido logo após o cadastro; sem dados, volta ao login
  if (!state?.email) {
    return <Navigate to="/login" replace />
  }

  return (
    <AuthLayout>
      <div className="concluido">
        <div className="concluido__symbol">
          <Check size={26} />
        </div>

        <PageIntro
          label="CONFIRMAÇÃO"
          title="Cadastro concluído"
          description="Seu acesso de administrador foi criado com sucesso. Use suas credenciais para acessar o sistema."
        />

        <div className="concluido__summary">
          <div className="concluido__identity">
            <span className="concluido__avatar">{initialsOf(state.name)}</span>
            <div className="concluido__identity-text">
              <strong className="concluido__name">{state.name}</strong>
              <span className="concluido__email">{state.email}</span>
            </div>
          </div>
          <div className="concluido__permissions">
            <span className="concluido__role-label">Perfil de acesso</span>
            <span className="concluido__role-badge">
              <ShieldCheck size={12} />
              {roleLabel(state.role)}
            </span>
          </div>
        </div>

        <Alert variant="info" title="Próximo passo">
          Acesse o login com e-mail e a senha cadastrada para continuar.
        </Alert>

        <div className="concluido__next">
          <Button fullWidth rightIcon={<ArrowRight size={16} />} onClick={() => navigate('/login')}>
            Ir para o login
          </Button>
          <p className="concluido__guidance">Use suas credenciais para acessar o sistema.</p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default CadastroConcluido
