import { z } from "zod";

const password = z
  .string({ error: "Senha é obrigatória" })
  .min(1, "Senha é obrigatória")
  .pipe(
    z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .max(128, "A senha deve ter no máximo 128 caracteres")
      .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
      .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
      .regex(/\d/, "A senha deve conter ao menos um número")
      .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial")
  );

export const registerAdminSchema = {
  body: z.object({
    name: z
      .string({ error: "Nome é obrigatório" })
      .trim()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome muito curto"),
    email: z
      .string({ error: "E-mail é obrigatório" })
      .trim()
      .toLowerCase()
      .min(1, "E-mail é obrigatório")
      .pipe(z.email("E-mail inválido")),
    password,
  }),
};

export type RegisterAdminInput = z.infer<typeof registerAdminSchema.body>;