import Invoice from '../models/invoice.model.js';

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
      daysOverdue > 0 ? 'Days Overdue: ' + daysOverdue : 'Upcoming payment',
      'Prior reminders: ' + invoice.remainderCount,
      'Write 2-3 sentences, address client by name, firm but polite.',
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
    });

    const message = completion.choices[0].message.content;

    await Invoice.findByIdAndUpdate(invoice._id, { $inc: { remainderCount: 1 } });

    res.status(200).json({ message });
  } catch (error) {
    console.error('Reminder generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate reminder' });
  }
};
