import status from "http-status";
import { Badge } from "./badge.model";
import AppError from "../../errors/appError";
import UserModel from "../user/user.model";

const createBadge = async (
  name: string,
  minScore: number,
  maxScore: number,
  iconUrl: string
) => {
  const badge = await Badge.create({ name, minScore, maxScore, iconUrl });
  return badge;
};

const getAllBadges = async () => {
  const badges = await Badge.find().sort({ minScore: 1 });
  return badges;
};

const getBadgeById = async (id: string) => {
  const badge = await Badge.findById(id);
  if (!badge) {
    throw new AppError(status.NOT_FOUND, "Badge not found");
  }
  return badge;
};

const updateBadge = async (
  id: string,
  payload: Partial<{
    name: string;
    minScore: number;
    maxScore: number;
    iconUrl: string;
  }>
) => {
  const badge = await Badge.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!badge) {
    throw new AppError(status.NOT_FOUND, "Badge not found");
  }
  return badge;
};

const deleteBadge = async (id: string) => {
  const badge = await Badge.findByIdAndDelete(id);
  if (!badge) {
    throw new AppError(status.NOT_FOUND, "Badge not found");
  }
  // Remove badge from all users who have it
  await UserModel.updateMany(
    { currentBadge: id },
    { $set: { currentBadge: undefined } }
  );
};

const assignBadgeToUser = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.role !== "influencer") {
    throw new AppError(
      status.BAD_REQUEST,
      "Badges can only be assigned to influencers"
    );
  }

  const badges = await Badge.find().sort({ minScore: 1 });
  let assignedBadge = null;

  for (const badge of badges) {
    if (user.points >= badge.minScore && user.points <= badge.maxScore) {
      assignedBadge = badge;
      break;
    }
  }

  if (!assignedBadge) {
    throw new AppError(status.BAD_REQUEST, "No badge matches the user's score");
  }

  user.currentBadge = assignedBadge._id;
  user.autoAssignBadge = true;
  await user.save();
  return assignedBadge;
};

const removeBadgeFromUser = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  user.currentBadge = undefined;
  user.autoAssignBadge = false;
  await user.save();
};

export const BadgeService = {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  assignBadgeToUser,
  removeBadgeFromUser,
};
