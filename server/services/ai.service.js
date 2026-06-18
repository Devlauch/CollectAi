import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateReminderMessageAI = async (invoice) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  const daysOverdue = Math.max(
    0,
    Math.floor(
      (new Date() - new Date(invoice.dueDate)) /
        (1000 * 60 * 60 * 24)
    )
  );

  const prompt = `
You are an accounts receivable assistant.

Generate a professional payment reminder email.

Client Name: ${invoice.clientName}
Invoice Amount: INR ${invoice.amount}
Due Date: ${new Date(invoice.dueDate).toDateString()}
Days Overdue: ${daysOverdue}
Payment Link: ${invoice.paymentLink || "Not Provided"}

Rules:
1. Address the client by name.
2. Be professional and polite.
3. Mention the invoice amount.
4. Request payment as soon as possible.
5. Keep the email under 150 words.
6. Do not use markdown.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 250,
  });

  const content = completion?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");
  return content.trim();
};