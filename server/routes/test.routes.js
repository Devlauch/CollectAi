import express from "express";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js";

const router = express.Router();

router.get("/whatsapp", async (req, res) => {
  try {
    const result = await sendWhatsAppMessage(
      "919902917305",
      "CollectAI WhatsApp Test 🚀"
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;