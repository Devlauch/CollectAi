import express from 'express';

import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    getMyInvoices
} from "../controllers/invoice.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post('/', createInvoice);

router.get('/', getInvoices);
router.get("/my-invoices", getMyInvoices);
router.get('/:id', getInvoiceById);

router.put('/:id', updateInvoice);

router.delete('/:id', deleteInvoice);

export default router;