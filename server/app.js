import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import testRoutes from './routes/test.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/test", testRoutes);

app.get('/', (req, res) => {
    res.send('CollectAI API is running');
});

export default app;
