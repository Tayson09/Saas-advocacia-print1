import { mailer } from "./mailer.js";
import { env } from "../config/env.js";

type SendPasswordSetupEmailInput = {
  to: string;
  name: string;
  token: string;
};

type SendPasswordResetEmailInput = {
  to: string;
  name: string;
  token: string;
};

// monta a URL do front (hash router) para uma rota com token
function buildTokenUrl(route: string, token: string): string {
  const base = env.FRONTEND_URL.replace(/\/+$/, "");
  return `${base}/#/${route}?token=${encodeURIComponent(token)}`;
}

type ActionEmailInput = {
  name: string;
  intro: string;
  buttonLabel: string;
  actionUrl: string;
  noticeHtml: string;
};

// template único reutilizado pelos e-mails de ação (configurar senha, redefinir senha)
function renderActionEmail({ name, intro, buttonLabel, actionUrl, noticeHtml }: ActionEmailInput): string {
  return `
    <div style="font-family: sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

        <h2 style="color: #1e3a8a; font-size: 24px; margin-top: 0; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
          Verum — Sistema de Gestão Jurídica
        </h2>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
          Olá, <strong>${name}</strong>!
        </p>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px; color: #4b5563;">
          ${intro}
        </p>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${actionUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 64, 175, 0.2);">
            ${buttonLabel}
          </a>
        </div>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; font-size: 14px; color: #6b7280; border-left: 4px solid #9ca3af;">
          ${noticeHtml}
        </div>

      </div>
    </div>
  `;
}

// convite de primeiro acesso: o usuário define a senha para ativar a conta
export async function sendPasswordSetupEmail({ to, name, token }: SendPasswordSetupEmailInput) {
  const setupUrl = buildTokenUrl("complete-setup", token);

  const info = await mailer.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Configure sua senha — Verum",
    html: renderActionEmail({
      name,
      intro:
        "Sua conta foi cadastrada com sucesso no nosso sistema de advocacia. Para configurar a sua senha de acesso, clique no botão azul abaixo:",
      buttonLabel: "Configurar Minha Senha",
      actionUrl: setupUrl,
      noticeHtml: `
        <p style="margin: 0 0 8px 0;">⚠️ <strong>Aviso importante:</strong> O link acima expira em exatamente uma hora e só pode ser utilizado uma única vez.</p>
        <p style="margin: 0;">Se você não esperava receber este convite, pode ignorar este e-mail com segurança.</p>
      `,
    }),
  });

  return info;
}

// redefinição de senha: usuário esqueceu a senha e solicitou um novo link
export async function sendPasswordResetEmail({ to, name, token }: SendPasswordResetEmailInput) {
  const resetUrl = buildTokenUrl("reset-password", token);

  const info = await mailer.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Redefinição de senha — Verum",
    html: renderActionEmail({
      name,
      intro:
        "Recebemos uma solicitação para redefinir a senha da sua conta. Para criar uma nova senha, clique no botão azul abaixo:",
      buttonLabel: "Redefinir Minha Senha",
      actionUrl: resetUrl,
      noticeHtml: `
        <p style="margin: 0 0 8px 0;">⚠️ <strong>Aviso importante:</strong> O link acima expira em exatamente uma hora e só pode ser utilizado uma única vez.</p>
        <p style="margin: 0;">Se você não solicitou a redefinição, pode ignorar este e-mail — sua senha atual continua válida.</p>
      `,
    }),
  });

  return info;
}
