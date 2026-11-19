import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// transporte SMTP (Gmail por padrão). A porta 465 usa TLS implícito (secure);
// 587 usa STARTTLS. O usuário/senha vêm do .env (senha de app do Gmail).
export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});
