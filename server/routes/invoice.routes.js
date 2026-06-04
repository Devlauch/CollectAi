import express from 'express';

import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
} from "../controllers/invoice.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post('/', createInvoice);

router.get('/', getInvoices);

router.get('/:id', getInvoiceById);

router.put('/:id', updateInvoice);

router.delete('/:id', deleteInvoice);

export default router;