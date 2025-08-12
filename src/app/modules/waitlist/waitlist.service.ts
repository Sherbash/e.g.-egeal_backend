import axios from "axios";
import status from "http-status";
import AppError from "../../errors/appError";

const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "Waitlist";

const addToWaitlist = async (email: string, name?: string, toolId:string) => {
  if (!email) {
    throw new AppError(status.BAD_REQUEST, "Email is required");
  }

  const joinedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const payload = {
    email,
    toolId,
    name: name || "",
    joinedAt,
  };

  const res = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

  if (res.status !== 200) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to add to waitlist"
    );
  }

  return {
    success: true,
    message: "You have been added to the waitlist",
  };
};

export const WaitlistService = {
  addToWaitlist,
};
