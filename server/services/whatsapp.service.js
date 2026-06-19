import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg;

let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "collectai",
  }),
});

client.on("qr", (qr) => {
  console.log("\nSCAN THIS QR WITH WHATSAPP\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  isReady = true;
  console.log("✅ WhatsApp Ready");
});

client.on("authenticated", () => {
  console.log("✅ WhatsApp Authenticated");
});

client.initialize();

export const sendWhatsAppMessage = async (phone, message) => {
  try {
    console.log("================================");
    console.log("isReady:", isReady);
    console.log("phone:", phone);
    console.log("message:", message);
    console.log("================================");

    if (!isReady) {
      throw new Error("WhatsApp is not ready");
    }

    const formattedPhone = `${phone}@c.us`;

    console.log("formattedPhone:", formattedPhone);

    const isRegistered = await client.isRegisteredUser(formattedPhone);

    console.log("isRegistered:", isRegistered);

    const result = await client.sendMessage(
      formattedPhone,
      message
    );

    console.log("Message sent:", result);

    return {
      success: true,
    };
  } catch (error) {
    console.error("WhatsApp Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};