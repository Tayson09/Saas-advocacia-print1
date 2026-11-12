import { z } from "zod";

export const linkSchema = {
  create: {
    body: z
      .object({
        lawyerId: z.uuid({
          error: (issue) =>
            issue.input === undefined
              ? "O ID do advogado é obrigatório."
              : "O ID do advogado deve ser um UUID válido.",
        }),
        secretaryId: z.uuid({
          error: (issue) =>
            issue.input === undefined
              ? "O ID da secretária é obrigatório."
              : "O ID da secretária deve ser um UUID válido.",
        }),
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
    params: z.object({
      id: z.uuid("O ID informado não é um UUID válido."),
    }),
  },
  update: {
    params: z.object({
      id: z.uuid("O ID informado não é um UUID válido."),
    }),
    body: z.object({
      endDate: z.preprocess(
        (val) => {
          if (val === null || (typeof val === "string" && val.trim() === "")) {
            return undefined;
          }
          
          if (typeof val === "string") {
            return val.trim();
          }
        },
        z.iso.date("A data final é obrigatória e deve estar no formato AAAA-MM-DD").transform((val) => new Date(val)),
      ),
    }),
  },
};

export type LinkInput = z.infer<typeof linkSchema.create.body>;
export type EndLinkInput = z.infer<typeof linkSchema.end.params>;
