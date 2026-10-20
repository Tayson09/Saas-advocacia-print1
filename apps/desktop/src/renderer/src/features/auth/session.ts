const KEYS = {
  accessToken: 'auth:accessToken',
  refreshToken: 'auth:refreshToken',
  user: 'auth:user',
  rememberedEmail: 'auth:rememberedEmail'
} as const

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  user: SessionUser
}

export function saveSession(session: Session): void {
  localStorage.setItem(KEYS.accessToken, session.accessToken)
  localStorage.setItem(KEYS.refreshToken, session.refreshToken)
  localStorage.setItem(KEYS.user, JSON.stringify(session.user))
}

export function getSession(): Session | null {
  const accessToken = localStorage.getItem(KEYS.accessToken)
  const refreshToken = localStorage.getItem(KEYS.refreshToken)
  const userRaw = localStorage.getItem(KEYS.user)

  if (!accessToken || !refreshToken || !userRaw) return null

  try {
    return { accessToken, refreshToken, user: JSON.parse(userRaw) as SessionUser }
  } catch {
    clearSession()
    return null
  }
}

export function updateAccessToken(accessToken: string): void {
  localStorage.setItem(KEYS.accessToken, accessToken)
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.accessToken)
  localStorage.removeItem(KEYS.refreshToken)
  localStorage.removeItem(KEYS.user)
}

export function saveRememberedEmail(email: string): void {
  localStorage.setItem(KEYS.rememberedEmail, email)
}

export function getRememberedEmail(): string {
  return localStorage.getItem(KEYS.rememberedEmail) ?? ''
}

export function clearRememberedEmail(): void {
  localStorage.removeItem(KEYS.rememberedEmail)
}
