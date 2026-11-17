import type { Link } from './api'

export type LinkStatus = 'active' | 'scheduled' | 'ended' | 'canceled'

// data de hoje em AAAA-MM-DD (local), para comparar com as datas (date-only) do backend
export function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// extrai apenas a parte AAAA-MM-DD de uma data ISO
export function dateOnly(iso: string): string {
  return iso.slice(0, 10)
}

// deriva o estado do vínculo a partir das datas (o backend não envia um status pronto)
export function statusOf(link: Link, today: string = todayISO()): LinkStatus {
  if (link.canceledAt) return 'canceled'
  if (link.endDate && dateOnly(link.endDate) < today) return 'ended'
  if (dateOnly(link.startDate) > today) return 'scheduled'
  return 'active'
}

export const statusLabels: Record<LinkStatus, string> = {
  active: 'Ativo',
  scheduled: 'Agendado',
  ended: 'Encerrado',
  canceled: 'Cancelado'
}

// só vínculos ativos ou agendados podem ser encerrados/cancelados/editados
export function isModifiable(status: LinkStatus): boolean {
  return status === 'active' || status === 'scheduled'
}

// ordem de exibição: ativos e agendados primeiro, encerrados/cancelados por último
const statusOrder: Record<LinkStatus, number> = {
  active: 0,
  scheduled: 1,
  ended: 2,
  canceled: 3
}

export function sortLinks(links: Link[], today: string = todayISO()): Link[] {
  return [...links].sort((a, b) => {
    const byStatus = statusOrder[statusOf(a, today)] - statusOrder[statusOf(b, today)]
    if (byStatus !== 0) return byStatus
    // dentro do mesmo grupo, mais recentes primeiro
    return dateOnly(b.startDate).localeCompare(dateOnly(a.startDate))
  })
}

// formata AAAA-MM-DD (ou ISO) para DD/MM/AAAA
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [year, month, day] = dateOnly(iso).split('-')
  if (!year || !month || !day) return '—'
  return `${day}/${month}/${year}`
}
