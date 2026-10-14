import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './features/auth/pages/Login'
import CadastroAdmin from './features/auth/pages/CadastroAdmin'
import CadastroConcluido from './features/auth/pages/CadastroConcluido'
import AutocadastroBloqueado from './features/auth/pages/AutocadastroBloqueado'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-admin" element={<CadastroAdmin />} />
      <Route path="/cadastro-concluido" element={<CadastroConcluido />} />
      <Route path="/autocadastro-bloqueado" element={<AutocadastroBloqueado />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
