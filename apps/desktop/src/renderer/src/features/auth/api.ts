import { apiRequest } from '../../lib/http'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface RegisterAdminInput {
  name: string
  email: string
  password: string
}

// GET /api/setup/status -> indica se o cadastro inicial ainda está aberto
export async function getSetupStatus(): Promise<{ registrationOpen: boolean }> {
  return apiRequest('/setup/status')
}

// POST /api/setup/admin -> cria o primeiro administrador do sistema
export async function registerAdmin(input: RegisterAdminInput): Promise<AdminUser> {
  return apiRequest('/setup/admin', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

// TODO(RF01): substituir pelo endpoint real de login quando o backend expor a rota.
// Hoje não há autenticação de sessão/JWT na API; mantemos apenas o stub da UI.
export async function login(credentials: { email: string; password: string }): Promise<void> {
  void credentials
  throw new Error('Login ainda não implementado no backend (RF01).')
}
