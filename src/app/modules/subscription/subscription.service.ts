import axios from "axios";
import status from "http-status";
import AppError from "../../errors/appError";

const STEINHQ_URL = "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "EmailSubscriptions";

const subscribeEmail = async (email: string) => {
  if (!email) {
    throw new AppError(status.BAD_REQUEST, "Email is required");
  }

  const payload = {
    email,
    subscribedAt: new Date().toISOString(),
  };

  const res = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

  if (res.status !== 200) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to save email subscription");
  }

  return {
    success: true,
    message: "Subscribed successfully",
  };
};

export const EmailSubscriptionService = {
  subscribeEmail,
};
