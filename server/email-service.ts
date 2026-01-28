import nodemailer from 'nodemailer';
import { UserProfile } from './user-db';

// Configurações de e-mail (Hostinger como principal, Mailgun como fallback)
// As credenciais devem ser definidas como variáveis de ambiente no Railway.

const HOSTINGER_SMTP_CONFIG = {
  host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.HOSTINGER_SMTP_PORT || '465'),
  secure: process.env.HOSTINGER_SMTP_SECURE === 'true' || true, // true for 465, false for other ports
  auth: {
    user: process.env.HOSTINGER_SMTP_USER || 'noreply@supportyoutbtools.online',
    pass: process.env.HOSTINGER_SMTP_PASS || 'YOUR_HOSTINGER_PASSWORD', // MUST be set in Railway env vars
  },
};

const MAILGUN_SMTP_CONFIG = {
  host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
  port: parseInt(process.env.MAILGUN_SMTP_PORT || '587'),
  secure: process.env.MAILGUN_SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.MAILGUN_SMTP_USER || 'postmaster@sandbox-mailgun.org', // Mailgun Account 1
    pass: process.env.MAILGUN_SMTP_PASS || 'YOUR_MAILGUN_PASSWORD', // MUST be set in Railway env vars
  },
};

const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@supportyoutbtools.online';
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://tubetools.online'; // MUST be set in Railway env vars

/**
 * Cria um transportador de e-mail usando as configurações fornecidas.
 * @param config Configurações SMTP
 * @returns Transportador Nodemailer
 */
function createTransporter(config: any) {
  return nodemailer.createTransport(config);
}

/**
 * Envia um e-mail usando o transportador principal (Hostinger) com fallback para o Mailgun.
 * @param to Destinatário
 * @param subject Assunto do e-mail
 * @param html Conteúdo HTML do e-mail
 * @returns True se o e-mail foi enviado com sucesso, False caso contrário.
 */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const mailOptions = {
    from: SENDER_EMAIL,
    to: to,
    subject: subject,
    html: html,
  };

  // 1. Tenta Hostinger
  try {
    const hostingerTransporter = createTransporter(HOSTINGER_SMTP_CONFIG);
    const info = await hostingerTransporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent successfully via Hostinger to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send email via Hostinger to ${to}. Error:`, error);
    
    // 2. Tenta Mailgun (Fallback)
    try {
      const mailgunTransporter = createTransporter(MAILGUN_SMTP_CONFIG);
      const info = await mailgunTransporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully via Mailgun (Fallback) to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (mailgunError) {
      console.error(`[EmailService] Failed to send email via Mailgun (Fallback) to ${to}. Error:`, mailgunError);
      return false;
    }
  }
}

/**
 * Envia o e-mail de recuperação de senha.
 * @param user Perfil do usuário
 * @param resetToken Token de recuperação
 * @returns True se o e-mail foi enviado com sucesso, False caso contrário.
 */
export async function sendPasswordResetEmail(user: UserProfile, resetToken: string): Promise<boolean> {
  const resetLink = `${APP_BASE_URL}/reset-password?token=${resetToken}`;
  
  // O rodapé deve ser sempre em português: "Assista. Avalie. Participe."
  const footer = "Assista. Avalie. Participe.";

  // Os e-mails sempre precisam estar em inglês
  const subject = "TubeTools Password Reset Request";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d9534f;">Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You are receiving this email because we received a password reset request for your account.</p>
      <p>Click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #d9534f; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p>If you did not request a password reset, no further action is required.</p>
      <p>This link will expire in 1 hour.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 0.8em; color: #999; text-align: center;">
        ${footer}
      </p>
      <p style="font-size: 0.8em; color: #999; text-align: center;">
        <a href="${APP_BASE_URL}/unsubscribe" style="color: #999;">Unsubscribe</a>
      </p>
    </div>
  `;

  return sendEmail(user.email, subject, htmlContent);
}
