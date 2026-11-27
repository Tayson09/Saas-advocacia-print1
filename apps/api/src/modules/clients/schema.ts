import { z } from "zod";

// --------------------------------------------------
// Enums
// --------------------------------------------------

const clientTypeSchema = z.enum(["INDIVIDUAL", "COMPANY"]);

const addressTypeSchema = z.enum(["RESIDENTIAL", "COMMERCIAL", "OTHER"]);

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const normalizeDocument = (value: string) =>
  value.replace(/[.\-/\s]/g, "").toUpperCase();

const documentSchema = z.string().trim().transform(normalizeDocument);

// Validação de CPF
const isValidCPF = (cpf: string): boolean => {
  if (!/^\d{11}$/.test(cpf)) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (digits: string, factor: number) => {
    const sum = digits
      .split("")
      .reduce(
        (total, digit, index) => total + Number(digit) * (factor - index),
        0,
      );

    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
};

// Validação de CNPJ numérico e alfanumérico
const isValidCNPJ = (cnpj: string): boolean => {
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false;

  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calculateDigit = (base: string): number => {
    const weights = [2, 3, 4, 5, 6, 7, 8, 9];

    const sum = base
      .split("")
      .reverse()
      .reduce((total, character, index) => {
        const value = character.charCodeAt(0) - 48;
        return total + value * weights[index % 8];
      }, 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12));
  const secondDigit = calculateDigit(cnpj.slice(0, 12) + firstDigit);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
};

// --------------------------------------------------
// Dados específicos de PF
// --------------------------------------------------

const individualDataSchema = z.strictObject({
  birthDate: z.iso
    .date("A data de nascimento deve estar no formato AAAA-MM-DD.")
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .optional(),

  rg: z.string().trim().optional(),

  maritalStatus: z.string().trim().optional(),

  profession: z.string().trim().optional(),

  nationality: z.string().trim().optional(),
});

// --------------------------------------------------
// Dados específicos de PJ
// --------------------------------------------------

const companyDataSchema = z.strictObject({
  tradeName: z.string().trim().optional(),

  stateRegistration: z.string().trim().optional(),

  municipalRegistration: z.string().trim().optional(),

  openingDate: z.iso
    .date("A data de abertura deve estar no formato AAAA-MM-DD.")
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .optional(),

  legalNature: z.string().trim().optional(),
});

// --------------------------------------------------
// Endereço
// --------------------------------------------------

const clientAddressSchema = z.strictObject({
  type: addressTypeSchema,

  zipCode: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().regex(/^\d{8}$/, "O CEP deve conter 8 dígitos.")),

  street: z.string().trim().min(1, "O logradouro é obrigatório."),

  number: z.string().trim().optional(),

  complement: z.string().trim().optional(),

  neighborhood: z.string().trim().optional(),

  city: z.string().trim().min(1, "A cidade é obrigatória."),

  state: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.string().regex(/^[A-Z]{2}$/, "Informe uma UF válida.")),

  isPrimary: z.boolean().optional(),
});

// --------------------------------------------------
// Dados comuns
// --------------------------------------------------

const commonClientFields = {
  name: z.string().trim().min(1, "O nome é obrigatório."),

  email: z
    .email("Informe um email válido.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),

  phone: z.string().trim().optional(),

  addresses: z
    .array(clientAddressSchema)
    .optional()
    .superRefine((addresses, ctx) => {
      if (!addresses) return;

      const primaryCount = addresses.filter(
        (address) => address.isPrimary === true,
      ).length;

      if (primaryCount > 1) {
        ctx.addIssue({
          code: "custom",
          message: "Informe apenas um endereço principal.",
        });
      }
    }),
};

// --------------------------------------------------
// Cadastro de cliente
// --------------------------------------------------

const individualClientSchema = z.strictObject({
  ...commonClientFields,

  type: z.literal("INDIVIDUAL"),

  document: documentSchema.refine(isValidCPF, {
    message: "O CPF informado é inválido.",
  }),

  individualData: individualDataSchema.optional(),
});

const companyClientSchema = z.strictObject({
  ...commonClientFields,

  type: z.literal("COMPANY"),

  document: documentSchema.refine(isValidCNPJ, {
    message: "O CNPJ informado é inválido.",
  }),

  companyData: companyDataSchema.optional(),
});

// --------------------------------------------------
// Schema exportado
// --------------------------------------------------

export const clientSchema = {
  create: {
    body: z.discriminatedUnion("type", [
      individualClientSchema,
      companyClientSchema,
    ]),
  },
};

// --------------------------------------------------
// Types
// --------------------------------------------------

export type CreateClientInput = z.infer<typeof clientSchema.create.body>;
