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

// wrapper de fetch que normaliza erros da API
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init
    })
  } catch {
    // falha de rede (API fora do ar, por exemplo)
    throw new ApiError(0, {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    })
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody)
  }

  return data as T
}
