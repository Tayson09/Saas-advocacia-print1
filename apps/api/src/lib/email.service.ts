import { resend } from "./resend.js";
import { env } from "../config/env.js";

type SendPasswordSetupEmailInput = {
  to: string;
  name: string;
  token: string;
}

export async function sendPasswordSetupEmail({ to, name, token }: SendPasswordSetupEmailInput) {
  const from = env.EMAIL_FROM
  const setupUrl = new URL("/complete-setup", env.FRONTEND_URL);
  setupUrl.searchParams.set("token", token);

  const { data, error } = await resend.emails.send(
    {
      from,
      to,
      subject: "Configure sua senha -- Verum",
       html: `
      <div style="font-family: sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Título principal (Logo/Nome do Sistema) -->
          <h2 style="color: #1e3a8a; font-size: 24px; margin-top: 0; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
            SaaS Advocacia
          </h2>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Olá, <strong>${name}</strong>!
          </p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px; color: #4b5563;">
            Sua conta foi cadastrada com sucesso no nosso sistema de advocacia. Para configurar a sua senha de acesso, clique no botão azul abaixo:
          </p>
          
          <!-- Botão de Ação com CSS Inline -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${setupUrl.toString()}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 64, 175, 0.2);">
              Configurar Minha Senha
            </a>
          </div>
          
          <!-- Alertas de Segurança -->
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; font-size: 14px; color: #6b7280; border-left: 4px solid #9ca3af;">
            <p style="margin: 0 0 8px 0;">⚠️ <strong>Aviso importante:</strong> O link acima expira em exatamente uma hora e só pode ser utilizado uma única vez.</p>
            <p style="margin: 0;">Se você não esperava receber este convite, pode ignorar este e-mail com segurança.</p>
          </div>
          
        </div>
      </div>
    `,
    }
  );

  if (error) throw new Error(`Falha ao enviar erro: ${error.message}`);

  return data;
}