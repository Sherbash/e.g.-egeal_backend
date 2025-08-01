import status from "http-status";
import { IUser, UserRole } from "../modules/user/user.interface";
import { Founder } from "../modules/founder/founder.model";
import AppError from "../errors/appError";
import { Influencer } from "../modules/influencer/influencer.model";
import { Investor } from "../modules/investor/investor.model";

export const findProfileByRole = async (user: IUser) => {
  let profile = null;

  if (user.role === UserRole.FOUNDER) {
    profile = await Founder.findOne({ userId: user.id }).populate("userId");
    if (!profile) {
      throw new AppError(status.NOT_FOUND, "Founder profile not found");
    }
  } else if (user.role === UserRole.INFLUENCER) {
    profile = await Influencer.findOne({ userId: user.id }).populate("userId");
    if (!profile) {
      throw new AppError(status.NOT_FOUND, "Influencer profile not found");
    }
  } else if (user.role === UserRole.INVESTOR) {
    profile = await Investor.findOne({ userId: user.id }).populate("userId");
    if (!profile) {
      throw new AppError(status.NOT_FOUND, "Investor profile not found");
    }
  } else {
    throw new AppError(
      status.FORBIDDEN,
      `${user.role} is not allowed to perform this action`
    );
  }

  return profile;
};
