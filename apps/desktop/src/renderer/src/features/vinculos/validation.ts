import { z } from 'zod'

// data no formato AAAA-MM-DD (o que o <input type="date"> produz)
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')

// criação de vínculo: advogado e secretária distintos, com início e fim opcional
export const createLinkSchema = z
  .object({
    lawyerId: z.string().min(1, 'Selecione o(a) advogado(a)'),
    secretaryId: z.string().min(1, 'Selecione o(a) secretário(a)'),
    startDate: z.string().min(1, 'Informe a data de início').pipe(isoDate),
    // string vazia = sem previsão de término
    endDate: z.union([isoDate, z.literal('')]).optional()
  })
  .refine((data) => data.lawyerId !== data.secretaryId, {
    message: 'Advogado(a) e secretário(a) devem ser pessoas diferentes',
    path: ['secretaryId']
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'A data final não pode ser anterior à de início',
    path: ['endDate']
  })

export type CreateLinkForm = z.infer<typeof createLinkSchema>

// edição da data final: aceita vazio (remover previsão) e não pode ser anterior ao início
export function validateEndDate(endDate: string, startDate: string): string | undefined {
  if (endDate === '') return undefined
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return 'Data inválida'
  if (endDate < startDate) return 'A data final não pode ser anterior à de início'
  return undefined
}
