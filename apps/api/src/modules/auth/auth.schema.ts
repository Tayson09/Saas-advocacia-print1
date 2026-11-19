import { z } from "zod";
import { password } from "../setup/setup.schema.js";

export const loginSchema = {
  body: z.object({
    email: z
        .string({ error: "E-mail é obrigatório" })
        .trim()
        .toLowerCase()
        .min(1, "E-mail é obrigatório")
        .pipe(z.email("E-mail inválido")),
    
    password: z
    .string({ error: "Senha é obrigatória" })
    .min(1, "Senha é obrigatória")
  })
}

export const refreshBodySchema = {
  body: z.object({
    refreshToken: z
    .string({
        error: "O campo 'refreshToken' é obrigatório e deve ser um texto válido."
      })
      .min(1, "O refresh token não pode estar vazio.")
  })
}

export const forgotPasswordSchema = {
  body: z.object({
    email: z
      .string({ error: "E-mail é obrigatório" })
      .trim()
      .toLowerCase()
      .min(1, "E-mail é obrigatório")
      .pipe(z.email("E-mail inválido")),
  })
}

export const resetPasswordSchema = {
  body: z.object({
    token: z.string({ error: "Token é obrigatório" }).min(1, "Token é obrigatório"),
    password,
  })
}

export type LoginInput = z.infer<typeof loginSchema.body>;
export type refreshInput = z.infer<typeof refreshBodySchema.body>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema.body>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema.body>;