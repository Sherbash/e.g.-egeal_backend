// affiliate.service.ts (or create payout.service.ts if you want separate module)
import axios from "axios";
import status from "http-status";
import AppError from "../../errors/appError";
import { Influencer } from "../influencer/influencer.model";
import { IUser } from "../user/user.interface";
import { IPayoutRequest } from "./payout.interface";
import { Affiliate } from "../affiliate/affiliate.model";

const STEINHQ_URL =
  "https://api.steinhq.com/v1/storages/6899386bc088333365ca37f4";
const SHEET_NAME = "PayoutRequests";

const createPayoutRequest = async (payload: IPayoutRequest) => {
  if (!payload.influencerId || !payload.amount) {
    throw new AppError(
      status.BAD_REQUEST,
      "Influencer ID and amount are required"
    );
  }

  // Check minimum payout amount
  if (payload.amount < 50) {
    throw new AppError(status.BAD_REQUEST, "Minimum payout amount is $50");
  }

  // Confirm influencer exists
  const influencer = await Influencer.findOne({
    influencerId: payload.influencerId,
  })
    .populate<{ userId: IUser }>("userId", "firstName lastName email")
    .lean();

  if (!influencer) {
    throw new AppError(status.NOT_FOUND, "Influencer not found");
  }

  // Format date in "Month DD, YYYY"
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Flatten the accountDetails into the main object
  const flattenedPayload = {
    ...payload,
    date: formattedDate, // formatted date
    ...payload.accountDetails,
    accountDetails: undefined,
  };

  // Save payout request to SteinHQ
  const res = await axios.post(`${STEINHQ_URL}/${SHEET_NAME}`, [
    flattenedPayload,
  ]);

  if (res.status !== 200) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to store payout request"
    );
  }

  // Reset all affiliate earnings for this influencer
  const updateResult = await Affiliate.updateMany(
    { influencerId: payload.influencerId },
    { $set: { earning: 0 } }
  );

  console.log(
    `Reset earnings for ${updateResult.modifiedCount} affiliate records`
  );

  return {
    success: true,
    message: "Payout request stored successfully and earnings reset",
  };
};

export const PayoutServices = {
  createPayoutRequest,
};
