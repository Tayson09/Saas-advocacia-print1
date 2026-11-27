import { z } from "zod";

export const createOfficeSchema = z.object(
  {
    cnpj: z
      .string({ error: "CNPJ é obrigatório" })
      .trim()
      .min(1, "CNPJ é obrigatório"),
    name: z
      .string({ error: "Nome do escritório é obrigatório" })
      .trim()
      .min(1, "Nome do escritório é obrigatório"),
    tradeName: z.string().trim().optional(),
  },
  { error: "Dados do escritório são obrigatórios" },
);

export type CreateOfficeInput = z.infer<typeof createOfficeSchema>;
