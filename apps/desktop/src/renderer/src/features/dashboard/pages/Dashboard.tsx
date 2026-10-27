import './Dashboard.css'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import AppLayout from '../../../components/layout/AppLayout'
import Button from '../../../components/ui/Button'
import { useAuth } from '../../auth/context'

function Dashboard(): React.JSX.Element {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AppLayout>
      <div className="dashboard">
        <header className="dashboard__head">
          <h1 className="dashboard__title">Painel</h1>
          <p className="dashboard__subtitle">
            Seu espaço de trabalho no Verum. Novos módulos aparecerão aqui em breve.
          </p>
        </header>

        {isAdmin && (
          <div className="dashboard__card">
            <div>
              <strong className="dashboard__card-title">Gestão de usuários</strong>
              <p className="dashboard__card-text">
                Adicione advogados(as) e secretários(as) à equipe do escritório.
              </p>
            </div>
            <Button leftIcon={<UserPlus size={16} />} onClick={() => navigate('/usuarios/novo')}>
              Cadastrar usuário
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default Dashboard
