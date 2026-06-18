import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  cashfreeWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.get("/verify/:orderId", protect, verifyPayment);
router.post("/webhook", cashfreeWebhook);

export default router;