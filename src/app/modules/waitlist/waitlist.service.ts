import axios from "axios";
import status from "http-status";
import AppError from "../../errors/appError";
import { IWaitlist } from "./waitlist.interface";

const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "Waitlist";

const addToWaitlist = async (email: string, toolId: string, name?: string) => {
  if (!email) {
    throw new AppError(status.BAD_REQUEST, "Email is required");
  }
  if (!toolId) {
    throw new AppError(status.BAD_REQUEST, "Tool ID is required");
  }

  const joinedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Explicitly map fields to match Google Sheet columns
  const payload = {
    email: email,
    name: name || "", // Ensure name is empty string if not provided
    toolId: toolId,   // Ensure toolId is correctly assigned
    joinedAt: joinedAt,
  };

  const res = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);

  if (res.status !== 200) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to add to waitlist");
  }

  return {
    success: true,
    message: "You have been added to the waitlist",
    data: payload, // Return the payload for reference
  };
};

const getAllWaitlistEntries = async (): Promise<IWaitlist[]> => {
  try {
    const res = await axios.get(`${STEINHQ_URL}/${SHEET_NAME}`);

    if (res.status !== 200) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch waitlist entries");
    }

    const waitlistEntries = res.data;

    // Map and validate response data to IWaitlist
    const validatedEntries: IWaitlist[] = waitlistEntries.map((item: any) => ({
      email: item.email,
      toolId: item.toolId, // Ensure toolId is correctly mapped
      name: item.name || undefined,
      joinedAt: item.joinedAt,
    }));

    return validatedEntries;
  } catch (error) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Error fetching waitlist entries");
  }
};

export const WaitlistService = {
  addToWaitlist,
  getAllWaitlistEntries,
};