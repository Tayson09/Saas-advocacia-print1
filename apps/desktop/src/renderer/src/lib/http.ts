// base da API REST (o desktop se comunica por HTTP, nunca acessa o banco direto)
const API_BASE_URL = 'http://localhost:3000/api'

export interface ApiErrorDetail {
  location: string
  path: string
  message: string
}

// formato de erro padronizado pelo errorHandler da API
export interface ApiErrorBody {
  status: 'error'
  code: string
  message: string
  details?: ApiErrorDetail[]
}

export class ApiError extends Error {
  code: string
  status: number
  details?: ApiErrorDetail[]

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
  }
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function tryRefresh(): Promise<string | null> {
  const { getSession, updateAccessToken, clearSession } = await import(
    '../features/auth/session'
  )
  const { refreshTokens } = await import('../features/auth/api')

  const session = getSession()
  if (!session) return null

  try {
    const data = await refreshTokens(session.refreshToken)
    updateAccessToken(data.accessToken)
    return data.accessToken
  } catch {
    clearSession()
    return null
  }
}

// wrapper de fetch que normaliza erros da API e inclui renovação automática de token
export async function apiRequest<T>(path: string, init?: RequestInit, _retry = true): Promise<T> {
  const { getSession } = await import('../features/auth/session')
  const session = getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>)
  }

  const isLoginRequest = path === '/auth/login'
  if (session?.accessToken && !isLoginRequest) {
    headers['Authorization'] = `Bearer ${session.accessToken}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch (err) {
    // detalhe técnico vai para o console (programador); usuário vê mensagem amigável
    console.error(`[API] falha ao conectar em ${API_BASE_URL}${path}:`, err)
    throw new ApiError(0, {
      status: 'error',
      code: 'NETWORK_ERROR',
      message:
        'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente em instantes.'
    })
  }

  if (response.status === 401 && _retry && !isLoginRequest && session?.accessToken) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await tryRefresh()
      isRefreshing = false

      if (newToken) {
        onRefreshed(newToken)
        return apiRequest<T>(path, init, false)
      }

      // refresh falhou: redireciona para login
      window.location.hash = '/login'
      throw new ApiError(401, {
        status: 'error',
        code: 'SESSION_EXPIRED',
        message: 'Sua sessão expirou. Faça login novamente.'
      })
    }

    // outra requisição já está renovando — aguarda o novo token
    return new Promise((resolve, reject) => {
      refreshSubscribers.push((token) => {
        const retryHeaders = { ...headers, Authorization: `Bearer ${token}` }
        apiRequest<T>(path, { ...init, headers: retryHeaders }, false).then(resolve, reject)
      })
    })
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const hasMessage = data && typeof data === 'object' && 'message' in data
    if (!hasMessage) {
      console.error(`[API] resposta ${response.status} sem corpo de erro para ${path}`)
    }
    const body: ApiErrorBody = hasMessage
      ? (data as ApiErrorBody)
      : {
          status: 'error',
          code: 'HTTP_ERROR',
          message: 'Ocorreu um erro inesperado. Tente novamente em instantes.'
        }
    throw new ApiError(response.status, body)
  }

  return data as T
}
