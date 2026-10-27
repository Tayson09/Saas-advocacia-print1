import { apiRequest } from '../../lib/http'
import type { SessionUser } from './session'

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

export interface RegisterUserInput {
  name: string
  email: string
  role: 'LAWYER' | 'SECRETARY'
}

export interface RegisterUserResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  // indica se o convite de configuração de senha foi enviado por e-mail
  emailSent: boolean
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshRawToken: string
  user: SessionUser
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
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

// POST /api/user/register -> admin cadastra um novo usuário (advogado/secretário)
// e dispara o convite de configuração de senha por e-mail
export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResponse> {
  return apiRequest('/user/register', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export interface CompleteSetupInput {
  token: string
  password: string
}

// POST /api/user/complete-setup -> usuário convidado define a própria senha
export async function completePasswordSetup(
  input: CompleteSetupInput
): Promise<{ message: string }> {
  return apiRequest('/user/complete-setup', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

// POST /api/auth/login -> autentica e retorna tokens + dados do usuário
export async function login(input: LoginInput): Promise<LoginResponse> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

// POST /api/auth/refresh -> renova o access token com o refresh token
export async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })
}
