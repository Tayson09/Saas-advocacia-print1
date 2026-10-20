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
