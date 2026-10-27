import './AppLayout.css'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Scale } from 'lucide-react'
import { useAuth } from '../../features/auth/context'
import { roleLabels } from '../../features/auth/validation'

interface AppLayoutProps {
  children: ReactNode
}

// iniciais do nome (até duas letras) para o avatar
function initialsOf(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// casca das telas autenticadas: topbar com marca + usuário + sair, conteúdo largo
function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar__brand">
          <span className="app-topbar__logo">
            <Scale size={18} />
          </span>
          <span className="app-topbar__name">VERUM</span>
        </div>

        <div className="app-topbar__user">
          <div className="app-topbar__identity">
            <span className="app-topbar__username">{user?.name}</span>
            <span className="app-topbar__role">
              {user ? (roleLabels[user.role] ?? user.role) : ''}
            </span>
          </div>
          <span className="app-topbar__avatar">{initialsOf(user?.name)}</span>
          <button type="button" className="app-topbar__logout" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <main className="app-content">{children}</main>
    </div>
  )
}

export default AppLayout
