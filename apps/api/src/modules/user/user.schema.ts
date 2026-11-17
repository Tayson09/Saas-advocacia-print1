import { z } from "zod";
import { UserRole } from "../../generated/prisma/enums.js";
import { password } from "../setup/setup.schema.js";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "O nome é obrigatório"),
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido")),
  role: z.enum(UserRole, {
    error: "Perfil de usuário inválido",
  })
});

export const completePasswordSetupSchema = z.object({
  token: z.string(),
  password,
})

// filtro opcional por perfil ao listar usuários (ex.: ?role=LAWYER)
export const listUsersQuerySchema = z.object({
  role: z.enum(UserRole, { error: "Perfil de usuário inválido" }).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CompletePasswordSetupInput = z.infer<typeof completePasswordSetupSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;