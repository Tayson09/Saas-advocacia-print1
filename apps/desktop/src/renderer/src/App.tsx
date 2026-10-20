import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/context'
import Login from './features/auth/pages/Login'
import CadastroAdmin from './features/auth/pages/CadastroAdmin'
import CadastroConcluido from './features/auth/pages/CadastroConcluido'
import AutocadastroBloqueado from './features/auth/pages/AutocadastroBloqueado'
import Dashboard from './features/dashboard/pages/Dashboard'

function PrivateRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-admin" element={<CadastroAdmin />} />
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
