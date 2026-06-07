import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";

import { sendEmail } from "../utils/sendEmail.js";
import { generateReminderMessageAI } from "../services/ai.service.js";

export const generateReminderMessage = async (
  req,
  res
) => {
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