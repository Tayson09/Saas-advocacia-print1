import { z } from "zod";
import { UserRole } from "../../generated/prisma/enums.js";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "O nome é obrigatório"),
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido")),
  role: z.enum(UserRole, {
    error: "Perfil de usuário inválido",
  })
});

export type CreateUserInput = z.infer<typeof createUserSchema>;