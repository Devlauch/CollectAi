import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateReminderMessageAI } from "../services/ai.service.js";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js";

export const generateReminderMessage = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // Generate AI reminder
    const message = await generateReminderMessageAI(invoice);

    // Email content
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

    // WhatsApp Message
    let whatsappResult = null;

    if (invoice.clientPhone) {
      let whatsappMessage = message;

      if (invoice.paymentLink) {
        whatsappMessage += `\n\n💳 Payment Link:\n${invoice.paymentLink}`;
      }

      whatsappResult = await sendWhatsAppMessage(
        invoice.clientPhone,
        whatsappMessage
      );
    }

    // Update reminder tracking
    await Invoice.findByIdAndUpdate(invoice._id, {
      $inc: { reminderCount: 1 },
      lastEmailSentAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      aiMessage: message,
      emailSentTo: invoice.clientEmail,
      whatsappSentTo: invoice.clientPhone || null,
      whatsappResult,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    console.error(
      "Reminder Generation Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate reminder",
    });
  }
};