import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.url({
    protocol: /^(postgres|postgresql)$/, 
    error: "DATABASE_URL é obrigatória e deve ser uma URL Postgres válida"
  }),

  JWT_SECRET: z.string({ error: "JWT_SECRET é obrigatório" }).min(32, "o segredo JWT deve possuir pelo menos 32 caracteres."),
  REFRESH_SECRET: z.string({ error: "REFRESH_SECRET é obrigatório" }).min(32, "o segredo do refresh eve possuir pelo menos 32 caracteres."),

  JWT_ISSUER:  z.string().default('api-advocacia'),
  JWT_AUDIENCE: z.string().default('electron-app'),

  // Envio de e-mail via SMTP (Gmail). SMTP_PASS é a "senha de app" do Gmail (16 caracteres).
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: z.string({ error: "SMTP_USER é obrigatório" }).min(1, "SMTP_USER é obrigatório"),
  SMTP_PASS: z.string({ error: "SMTP_PASS é obrigatório" }).min(1, "SMTP_PASS é obrigatório"),
  EMAIL_FROM: z.string({ error: "EMAIL_FROM é obrigatório" }),
  FRONTEND_URL: z.url({ error: "FRONTEND_URL deve ser uma URL válida" })
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const formattedErrors = z.prettifyError(_env.error);

  console.error("ERRO DE CONFIGURAÇÃO NAS VARIÁVEIS DE AMBIENTE:");
  console.error(formattedErrors);
  process.exit(1);
}

export const env = _env.data;