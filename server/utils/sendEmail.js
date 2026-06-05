import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[email] SMTP not configured — skipping send');
    return null;
  }
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'CollectAI'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
};
