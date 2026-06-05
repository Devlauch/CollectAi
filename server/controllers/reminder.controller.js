import Invoice from '../models/invoice.model.js';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/sendEmail.js';

export const generateReminderMessage = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ message: 'OpenAI API key not configured' });
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const daysOverdue = Math.max(
      0,
      Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))
    );

    const prompt = [
      'Generate a professional payment reminder for this invoice:',
      'Client: ' + invoice.clientName,
      'Amount: INR ' + invoice.amount,
      'Due: ' + new Date(invoice.dueDate).toDateString(),
      invoice.paymentLink ? 'Pay link: ' + invoice.paymentLink : 'No payment link provided',
      daysOverdue > 0 ? 'Days Overdue: ' + daysOverdue : 'Upcoming payment',
      'Prior reminders: ' + invoice.remainderCount,
      'Write 2-3 sentences, address client by name, firm but polite.',
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
    });

    const message = completion?.choices?.[0]?.message?.content?.trim();
    if (!message) {
      return res.status(502).json({ message: 'Failed to generate reminder from OpenAI response' });
    }

    await Invoice.findByIdAndUpdate(invoice._id, {
      $inc: { remainderCount: 1 },
      lastEmailSentAt: new Date(),
    });

    // Send email if SMTP is configured
    const subject = `Payment Reminder — INR ${invoice.amount}`;
    const html = `<p>${message.replace(/\n/g, '<br/>')}</p>${invoice.paymentLink ? `<p><a href="${invoice.paymentLink}">Pay Now</a></p>` : ''}`;
    sendEmail({ to: invoice.clientEmail, subject, html }).catch(err =>
      console.error('[reminder] Email send failed:', err.message)
    );

    res.status(200).json({ message });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid invoice ID' });
    }
    console.error('Reminder generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate reminder' });
  }
};
