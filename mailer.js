import nodemailer from 'nodemailer';

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) {
    return null; // SMTP not configured -> noop
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  return transporter;
}

export async function send(to, subject, html) {
  const t = getTransporter();
  if (!t) {
    console.log('[mailer] SMTP not configured, skipping send to', to, subject);
    return;
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || 'EcoRide <noreply@ecoride.local>',
    to,
    subject,
    html
  });
}
