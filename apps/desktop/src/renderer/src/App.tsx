import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/context'
import { ToastProvider } from './components/ui/Toast'
import Login from './features/auth/pages/Login'
import CadastroAdmin from './features/auth/pages/CadastroAdmin'
import CadastroUsuario from './features/auth/pages/CadastroUsuario'
import CompletarCadastro from './features/auth/pages/CompletarCadastro'
import CadastroConcluido from './features/auth/pages/CadastroConcluido'
import AutocadastroBloqueado from './features/auth/pages/AutocadastroBloqueado'
import Dashboard from './features/dashboard/pages/Dashboard'

function PrivateRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// rota restrita ao administrador: a API também valida (requireAdmin),
// mas evitamos exibir a tela para quem não tem permissão
function AdminRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-admin" element={<CadastroAdmin />} />
      <Route path="/complete-setup" element={<CompletarCadastro />} />
      <Route path="/cadastro-concluido" element={<CadastroConcluido />} />
      <Route path="/autocadastro-bloqueado" element={<AutocadastroBloqueado />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/novo"
        element={
          <AdminRoute>
            <CadastroUsuario />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App(): React.JSX.Element {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
