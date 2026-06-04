import Invoice from "../models/invoice.model.js";

export const createInvoice = async (req, res) => {
  try {
    const { clientName, clientEmail, amount, dueDate, description } = req.body;

    if (!clientName || !clientEmail || !amount || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const invoice = await Invoice.create({
      user: req.user._id,
      clientName,
      clientEmail,
      amount,
      dueDate,
      description,
    });

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Invoices retrieved successfully', invoices });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice retrieved successfully', invoice });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { clientName, clientEmail, amount, dueDate, description, status } = req.body;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoice._id,
      { clientName, clientEmail, amount, dueDate, description, status },
      { new: true }
    );

    res.status(200).json({ message: 'Invoice updated successfully', invoice: updatedInvoice });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.deleteOne();

    return res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
