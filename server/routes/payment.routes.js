import express from "express";

import {
  createOrder,
  verifyPayment,
  cashfreeWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post(
  "/create-order",
  createOrder
);

router.get(
  "/verify/:orderId",
  verifyPayment
);

router.post(
  "/webhook",
  cashfreeWebhook
);

export default router;