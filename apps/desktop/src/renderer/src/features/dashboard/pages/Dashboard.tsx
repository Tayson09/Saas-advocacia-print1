import { useNavigate } from 'react-router-dom'
import { LogOut, UserPlus } from 'lucide-react'
import { useAuth } from '../../auth/context'
import Button from '../../../components/ui/Button'
import { roleLabels } from '../../auth/validation'

function Dashboard(): React.JSX.Element {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'ADMIN'

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1>Bem-vindo, {user?.name}</h1>
      <p>Perfil: {user ? (roleLabels[user.role] ?? user.role) : ''}</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {isAdmin && (
          <Button
            leftIcon={<UserPlus size={16} />}
            onClick={() => navigate('/usuarios/novo')}
          >
            Cadastrar usuário
          </Button>
        )}
        <Button variant="secondary" leftIcon={<LogOut size={16} />} onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </div>
  )
}

export default Dashboard
