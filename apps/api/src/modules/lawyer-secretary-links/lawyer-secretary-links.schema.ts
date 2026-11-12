import { z } from "zod";

const idParamsSchema = z.object({
  id: z.uuid("O ID informado não é um UUID válido."),
});

const requiredUuid = (message: string): z.ZodUUID => {
  return z.uuid({
    error: (issue) =>
      issue.input === undefined
        ? `${message} é obrigatório.`
        : `${message} deve ser um UUID válido.`,
  });
};

export const linkSchema = {
  create: {
    body: z
      .object({
        lawyerId: requiredUuid("O ID do advogado"),
        secretaryId: requiredUuid("O ID da secretária"),
        startDate: z.iso
          .date("A data deve estar no formato AAAA-MM-DD")
          .transform((val) => new Date(val)),
        endDate: z.iso
          .date()
          .nullish()
          .transform((val) => (val ? new Date(val) : null)),
      })
      .refine((data) => !data.endDate || data.endDate >= data.startDate, {
        message: "A data final não pode ser anterior à data de início.",
        path: ["endDate"],
      }),
  },
  end: {
    params: idParamsSchema,
  },
  update: {
    params: idParamsSchema,
    body: z.object({
      endDate: z.preprocess(
        (val) => {
          if (val === null || (typeof val === "string" && val.trim() === "")) {
            return undefined;
          }

          return typeof val === "string" ? val.trim() : val;
        },
        z.iso
          .date("A data final é obrigatória e deve estar no formato AAAA-MM-DD")
          .transform((val) => new Date(val)),
      ),
    }),
  },
};

export type LinkInput = z.infer<typeof linkSchema.create.body>;
export type EndLinkInput = z.infer<typeof linkSchema.end.params>;
export type UpdateBodyLinkInput = z.infer<typeof linkSchema.update.body>;
export type UpdateParamsLinkInput = z.infer<typeof linkSchema.update.params>;
