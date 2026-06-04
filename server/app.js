import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
})

export default app;