import Invoice from "../models/invoice.model.js";
import { attachRecipientStatus } from "../services/invoice.service.js";

export const createInvoice = async (req, res) => {

  try {

    const { clientName, clientEmail, amount, dueDate, description, paymentLink } = req.body;



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

      paymentLink,

    });



    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: await attachRecipientStatus(invoice),
    });

  } catch (error) {

    res.status(400).json({ message: error.message });

  }

};


export const getInvoices = async (req, res) => {

  try {

    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });

    const enrichedInvoices = await Promise.all(invoices.map(attachRecipientStatus));

    res.status(200).json({ message: 'Invoices retrieved successfully', invoices: enrichedInvoices });

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



    res.status(200).json({
      message: 'Invoice retrieved successfully',
      invoice: await attachRecipientStatus(invoice),
    });

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

    const updatedInvoice = await Invoice.findByIdAndUpdate(

      invoice._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );



    res.status(200).json({
      message: 'Invoice updated successfully',
      invoice: await attachRecipientStatus(updatedInvoice),
    });

  } catch (error) {

    res.status(400).json({ message: "Internal server error" });

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

// Invoices where the logged-in user is the CLIENT (sent to them by someone else)
export const getReceivedInvoices = async (req, res) => {
  try {
    console.log("Logged in email:", req.user.email);

    const invoices = await Invoice.find({
      clientEmail: req.user.email,
    })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    console.log("Found invoices:", invoices.length);

    res.status(200).json({ invoices });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};