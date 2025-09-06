import status from "http-status";
import AppError from "../../errors/appError";
import axios from "axios";


const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "HomePopupEntries";

const joinPopup = async (firstAnswer: string, secondAnswer: string ) => {
  if (!firstAnswer) {
    throw new AppError(status.BAD_REQUEST, "First answer is required");
  }
  if (!secondAnswer) {
    throw new AppError(status.BAD_REQUEST, "Second answer is required");
  }

  const answerdAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric", 
  });

  // Explicitly map fields to match Google Sheet columns
  const payload = {
    firstAnswer: firstAnswer,
    secondAnswer: secondAnswer , // Ensure name is empty string if not provided
    answerdAt: answerdAt,
  };

  const res = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [payload]);
  

  if (res.status !== 200) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to add to PopupEntries");
  }

  return {
    success: true,
    message: "Added data successfully",
    data: payload, // Return the payload for reference
  };
};

// const getAllWaitlistEntries = async (): Promise<IWaitlist[]> => {
//   try {
//     const res = await axios.get(`${STEINHQ_URL}/${SHEET_NAME}`);

//     if (res.status !== 200) {
//       throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch waitlist entries");
//     }

//     const waitlistEntries = res.data;

//     // Map and validate response data to IWaitlist
//     const validatedEntries: IWaitlist[] = waitlistEntries.map((item: any) => ({
//       email: item.email,
//       toolId: item.toolId, // Ensure toolId is correctly mapped
//       name: item.name || undefined,
//       joinedAt: item.joinedAt,
//     }));

//     return validatedEntries;
//   } catch (error) {
//     throw new AppError(status.INTERNAL_SERVER_ERROR, "Error fetching waitlist entries");
//   }
// };

export const HomePopupService = {
  joinPopup,
//   getAllWaitlistEntries,
};