// =============================================================
// izhubs ERP — Email System
// Supports SMTP and Resend. Configure via .env.local.
// Usage: import { sendEmail } from '@/lib/email'
// =============================================================

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  // TODO: implement — choose provider via EMAIL_PROVIDER env var
  // Supported: 'resend' | 'smtp'
  const provider = process.env.EMAIL_PROVIDER ?? 'smtp';

  if (provider === 'resend') {
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send(payload);
  } else {
    // const nodemailer = await import('nodemailer');
    // const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, ... });
    // await transporter.sendMail(payload);
  }

  console.log('[email] stub — would send to:', payload.to, '| subject:', payload.subject);
}

export function buildTemplate(name: 'welcome' | 'deal-won' | 'reminder', data: Record<string, unknown>): string {
  // TODO: implement template engine (React Email or simple string templates)
  return `<p>Template: ${name} | Data: ${JSON.stringify(data)}</p>`;
}
