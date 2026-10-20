import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context'

function Dashboard(): React.JSX.Element {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Bem-vindo, {user?.name}</h1>
      <p>Perfil: {user?.role}</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  )
}

export default Dashboard
