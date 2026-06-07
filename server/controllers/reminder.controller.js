import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";

import { sendEmail } from "../utils/sendEmail.js";
import { generateReminderMessageAI } from "../services/ai.service.js";

export const generateReminderMessage = async (
  req,
  res
) => {
  try {
<<<<<<< Updated upstream
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
=======
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ message: 'Groq API key not configured' });
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

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
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
    });

    const message = completion?.choices?.[0]?.message?.content?.trim();
    if (!message) {
      return res.status(502).json({ message: 'Failed to generate reminder from Groq response' });
>>>>>>> Stashed changes
    }

    // Generate AI Reminder
    const message =
      await generateReminderMessageAI(invoice);

    const subject = `Payment Reminder - INR ${invoice.amount}`;

    const html = `
      <div>
        <p>${message.replace(/\n/g, "<br/>")}</p>

        ${
          invoice.paymentLink
            ? `
              <p style="margin-top:20px;">
                <a
                  href="${invoice.paymentLink}"
                  style="
                    background:#2563eb;
                    color:white;
                    padding:10px 20px;
                    text-decoration:none;
                    border-radius:6px;
                  "
                >
                  Pay Now
                </a>
              </p>
            `
            : ""
        }
      </div>
    `;

    // Send Email
    await sendEmail({
      to: invoice.clientEmail,
      subject,
      html,
    });

    // Update Reminder Stats ONLY after successful email
    await Invoice.findByIdAndUpdate(invoice._id, {
      $inc: {
        reminderCount: 1,
      },

      lastEmailSentAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      aiMessage: message,
      emailSentTo: invoice.clientEmail,
    });

  } catch (error) {

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    console.error(
      "Reminder Generation Error:",
      error.message
    );

    return res.status(500).json({
      message: error.message || "Failed to generate reminder",
    });
  }
};