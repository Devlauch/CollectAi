import Cashfree from "../config/cashfree.js";
import Invoice from "../models/invoice.model.js";

export const createOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const orderId = "INV_" + invoice._id + "_" + Date.now();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const request = {
      order_amount: invoice.amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: invoice._id.toString(),
        customer_name: invoice.clientName,
        customer_email: invoice.clientEmail,
        customer_phone: invoice.clientPhone || "9999999999",
      },
      order_meta: {
        return_url: `${clientUrl}/payment-success?order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder(
      Cashfree.XApiVersion,
      request
    );

    invoice.cashfreeOrderId = orderId;
    await invoice.save();

    res.status(200).json({
      success: true,
      payment_session_id:
        response.data.payment_session_id,
      orderId,
    });
  } catch (error) {
    console.log("FULL ERROR:");
    console.log(error);

    console.log("ERROR RESPONSE:");
    console.log(error.response?.data);

    return res.status(500).json({
      success: false,
      message: error.message,
      error: error.response?.data,
    });
  }
};

export const verifyPayment = async (
  req,
  res
) => {
  try {
    const { orderId } = req.params;

    const response =
      await Cashfree.PGFetchOrder(Cashfree.XApiVersion, orderId);

    const orderStatus =
      response.data.order_status;

    const invoice =
      await Invoice.findOne({
        cashfreeOrderId: orderId,
      });

    if (!invoice) {
      return res.status(404).json({
        success: false,
      });
    }

    if (orderStatus === "PAID") {
      invoice.status = "paid";
      invoice.paymentStatus = "PAID";
      invoice.paidAt = new Date();

      await invoice.save();
    }

    res.status(200).json({
      success: true,
      orderStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cashfreeWebhook = async (
  req,
  res
) => {
  try {
    const data = req.body;

    const orderId =
      data?.data?.order?.order_id;

    const paymentStatus =
      data?.data?.payment
        ?.payment_status;

    if (
      paymentStatus ===
      "SUCCESS"
    ) {
      const invoice =
        await Invoice.findOne({
          cashfreeOrderId: orderId,
        });

      if (invoice) {
        invoice.status = "paid";
        invoice.paymentStatus = "PAID";
        invoice.paidAt = new Date();

        await invoice.save();
      }
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
    });
  }
};