import User from "../models/user.model.js";

export const attachRecipientStatus = async (invoice) => {
  const recipient = await User.findOne({
    email: invoice.clientEmail,
  }).select("name email");

  return {
    ...invoice.toObject(),
    recipientOnPlatform: recipient
      ? {
          name: recipient.name,
          email: recipient.email,
        }
      : null,
  };
};