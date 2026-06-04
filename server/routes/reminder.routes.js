import express from 'express';
import { generateReminderMessage } from '../controllers/reminder.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.post('/:id/remind', generateReminderMessage);

export default router;
