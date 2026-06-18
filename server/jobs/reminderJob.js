import cron from 'node-cron';
import Invoice from '../models/invoice.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateReminderMessageAI } from '../services/ai.service.js';

const generateReminderText = async (invoice) => {
  try {
    return await generateReminderMessageAI(invoice);
  } catch (err) {
    console.error('[cron] Groq error:', err.message);
    return null;
  }
};

const markOverdueInvoices = async () => {
  const now = new Date();
  const result = await Invoice.updateMany(
    { status: 'pending', dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
  if (result.modifiedCount > 0) {
    console.log(`[cron] Marked ${result.modifiedCount} invoice(s) as overdue`);
  }
};

const sendOverdueReminders = async () => {
  // Only send if last email was more than 24h ago (or never sent)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const invoices = await Invoice.find({
    status: 'overdue',
    $or: [{ lastEmailSentAt: { $lt: cutoff } }, { lastEmailSentAt: null }],
  }).populate('user', 'name email');

  if (!invoices.length) return;
  console.log(`[cron] Sending reminders for ${invoices.length} overdue invoice(s)`);

  for (const inv of invoices) {
    const message = await generateReminderText(inv);
    const subject = `Payment Reminder — INR ${inv.amount} overdue`;
    const html = message
      ? `<p>${message.replace(/\n/g, '<br/>')}</p>${inv.paymentLink ? `<p><a href="${inv.paymentLink}">Pay Now</a></p>` : ''}`
      : `<p>Dear ${inv.clientName}, your payment of INR ${inv.amount} is overdue. Please settle it at the earliest.</p>${inv.paymentLink ? `<p><a href="${inv.paymentLink}">Pay Now</a></p>` : ''}`;

    try {
      await sendEmail({ to: inv.clientEmail, subject, html });
      await Invoice.findByIdAndUpdate(inv._id, {
        lastEmailSentAt: new Date(),
        $inc: { reminderCount: 1 },
      });
      console.log(`[cron] Reminder sent → ${inv.clientEmail}`);
    } catch (err) {
      console.error(`[cron] Failed to send to ${inv.clientEmail}:`, err.message);
    }
  }
};

export const startReminderJob = () => {
  // Runs every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[cron] Daily reminder job started');
    await markOverdueInvoices();
    await sendOverdueReminders();
    console.log('[cron] Daily reminder job done');
  });

  // Also mark overdue on startup (catches any that were missed)
  markOverdueInvoices().catch(console.error);
  console.log('[cron] Reminder job scheduled (daily at 09:00)');
};
