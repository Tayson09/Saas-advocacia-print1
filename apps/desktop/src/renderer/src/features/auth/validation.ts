import { z } from 'zod'

// requisitos de senha espelhando setup.schema.ts do backend (RN05)
export const passwordRequirements = [
  { key: 'length', label: '8+ caracteres', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: 'Letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { key: 'number', label: 'Número', test: (v: string) => /\d/.test(v) },
  { key: 'special', label: 'Caractere especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) }
] as const

const password = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .max(128, 'A senha deve ter no máximo 128 caracteres')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
  .regex(/\d/, 'A senha deve conter ao menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um caractere especial')

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'E-mail é obrigatório')
    .pipe(z.email('E-mail inválido')),
  password: z.string().min(1, 'Senha é obrigatória')
})

// nome: letras (com acento), espaços e pontuação simples — rejeita e-mails/números
export const nameRegex = /^\p{L}[\p{L}\s.'-]*$/u

export function isValidName(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= 2 && nameRegex.test(trimmed)
}

export const registerAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nome é obrigatório')
      .min(2, 'Nome muito curto')
      .regex(nameRegex, 'Informe um nome válido (somente letras)'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'E-mail é obrigatório')
      .pipe(z.email('E-mail inválido')),
    password,
    confirmPassword: z.string(),
    consent: z.literal(true, { error: 'É necessário aceitar os termos' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  })

export type RegisterAdminForm = z.infer<typeof registerAdminSchema>

// quantos requisitos a senha cumpre (0..5) — usado pelo medidor de força
export function passwordScore(value: string): number {
  return passwordRequirements.filter((req) => req.test(value)).length
}
