import {
  connectWhatsApp,
  getStatus,
  getQRCode,
  disconnectWhatsApp,
} from "../services/whatsapp.service.js";

export const connect = async (req, res) => {
  try {
    const result = await connectWhatsApp(
      req.user._id.toString()
    );

    return res.status(200).json(result);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const status = async (req, res) => {
  try {

    console.log("Logged in user:", req.user._id);
  console.log("Logged in email:", req.user.email);

    const result = await getStatus(
      req.user._id.toString()
    );

    return res.status(200).json(result);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

export const qr = async (req, res) => {

  try {

    const result = await getQRCode(
      req.user._id.toString()
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "QR not available",
      });
    }

    return res.status(200).json({
      success: true,
      qr: result,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

export const logout = async (req, res) => {

  try {

    const result =
      await disconnectWhatsApp(
        req.user._id.toString()
      );

    return res.status(200).json(result);

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};