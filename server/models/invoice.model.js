import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        required: true,
        lowercase: true
    },
    amount: {
        type: Number,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    description: {
        type: String,
        default: "",
    },
    paymentLink: {
        type: String,
        default: ""
    },
    reminderCount: {
        type: Number,
        default: 0
    },
    lastEmailSentAt: {
        type: Date,
        default: null
    },
    cashfreeOrderId: {
        type: String,
        default: ""
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    paidAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;