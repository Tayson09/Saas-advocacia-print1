import './AutocadastroBloqueado.css'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LockKeyhole, Mail, MessageSquare, UserCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import PageIntro from '../components/PageIntro'
import Button from '../../../components/ui/Button'

interface Instruction {
  icon: ReactNode
  title: string
  description: string
}

const instructions: Instruction[] = [
  {
    icon: <MessageSquare size={15} />,
    title: 'Fale com o administrador',
    description: 'Entre em contato com o responsável pelo sistema na sua equipe.'
  },
  {
    icon: <Mail size={15} />,
    title: 'Informe seu e-mail',
    description: 'Use seu e-mail pessoal, como um endereço do Gmail.'
  },
  {
    icon: <UserCheck size={15} />,
    title: 'Aguarde a orientação de acesso',
    description: 'O administrador definirá seu perfil e enviará as instruções para entrar.'
  }
]

function AutocadastroBloqueado(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className="bloqueado">
        <div className="bloqueado__symbol">
          <LockKeyhole size={24} />
        </div>

        <PageIntro
          title="O autocadastro está indisponível"
          description="Este sistema já possui um administrador. Por segurança, novos cadastros são criados por ele."
        />

        <div className="bloqueado__instructions">
          <strong className="bloqueado__instructions-title">Como solicitar seu acesso</strong>
          {instructions.map((item) => (
            <div key={item.title} className="bloqueado__instruction">
              <span className="bloqueado__instruction-symbol">{item.icon}</span>
              <div className="bloqueado__instruction-content">
                <strong className="bloqueado__instruction-heading">{item.title}</strong>
                <span className="bloqueado__instruction-description">{item.description}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bloqueado__action">
          <Button fullWidth leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/login')}>
            Voltar para o login
          </Button>
          <p className="bloqueado__guidance">Já tem uma conta? Entre com suas credenciais.</p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default AutocadastroBloqueado
