import { apiRequest } from '../../lib/http'

// Vínculo advogado(a) ↔ secretário(a): o administrador define quais secretários(as)
// apoiam cada advogado(a), com data de início e (opcionalmente) de término.
// Contrato do backend (módulo lawyer-secretary-links, montado em /link):
//   GET    /api/user?role=LAWYER|SECRETARY  -> lista usuários ativos do perfil
//   GET    /api/link/all                    -> lista todos os vínculos (com nomes)
//   POST   /api/link                        -> cria vínculo { lawyerId, secretaryId, startDate, endDate? }
//   PATCH  /api/link/:id/end                -> encerra o vínculo (define fim = hoje)
//   PATCH  /api/link/:id/cancel  { reason } -> cancela o vínculo
//   PATCH  /api/link/:id         { endDate }-> altera a data final (null remove a previsão)

export type UserRole = 'ADMIN' | 'LAWYER' | 'SECRETARY'

export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
}

export interface LinkPerson {
  name: string
  email: string
}

// um vínculo como retornado por GET /link/all (datas em ISO)
export interface Link {
  id: string
  lawyerId: string
  secretaryId: string
  canceledById: string | null
  startDate: string
  endDate: string | null
  cancellationReason: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
  lawyer: LinkPerson
  secretary: LinkPerson
}

export interface CreateLinkInput {
  lawyerId: string
  secretaryId: string
  // formato AAAA-MM-DD
  startDate: string
  endDate?: string | null
}

// GET /api/user?role=... -> usuários ativos de um perfil (para os seletores)
export async function listUsersByRole(role: UserRole): Promise<UserSummary[]> {
  const data = await apiRequest<{ users?: UserSummary[] }>(`/user?role=${encodeURIComponent(role)}`)
  return data.users ?? []
}

// GET /api/link/all -> todos os vínculos cadastrados, com nome/e-mail de cada parte
export async function listLinks(): Promise<Link[]> {
  const data = await apiRequest<unknown>('/link/all')
  return Array.isArray(data) ? (data as Link[]) : []
}

// POST /api/link -> cria o vínculo
export async function createLink(input: CreateLinkInput): Promise<Link> {
  return apiRequest<Link>('/link', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

// PATCH /api/link/:id/end -> encerra o vínculo (data final = hoje)
export async function endLink(id: string): Promise<void> {
  await apiRequest<unknown>(`/link/${encodeURIComponent(id)}/end`, { method: 'PATCH' })
}

// PATCH /api/link/:id/cancel -> cancela o vínculo, registrando o motivo
export async function cancelLink(id: string, reason: string): Promise<void> {
  await apiRequest<unknown>(`/link/${encodeURIComponent(id)}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(reason.trim() ? { reason: reason.trim() } : {})
  })
}

// PATCH /api/link/:id -> altera a data final (null remove a previsão de término)
export async function updateLinkEndDate(id: string, endDate: string | null): Promise<void> {
  await apiRequest<unknown>(`/link/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ endDate })
  })
}
