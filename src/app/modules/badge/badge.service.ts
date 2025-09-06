import status from "http-status";
import { Badge } from "./badge.model";
import AppError from "../../errors/appError";
import UserModel from "../user/user.model";
import mongoose from "mongoose";

const createBadge = async (
  name: string,
  minScore: number,
  maxScore: number,
  iconUrl: string
) => {
  const badgeCount = await Badge.countDocuments();
  if (badgeCount >= 10) {
    throw new AppError(
      status.BAD_REQUEST,
      "Maximum of 10 badges allowed. Please delete an existing badge before creating a new one."
    );
  }

  // Optional: Validate non-overlapping ranges
  const overlappingBadge = await Badge.findOne({
    $or: [{ minScore: { $lte: maxScore }, maxScore: { $gte: minScore } }],
  });
  if (overlappingBadge) {
    throw new AppError(
      status.BAD_REQUEST,
      `Score range overlaps with existing badge: ${overlappingBadge.name}`
    );
  }

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
  // Remove badge from all users' earnedBadges
  await UserModel.updateMany(
    { earnedBadges: id },
    { $pull: { earnedBadges: id } }
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
  const assignedBadges = [];

  for (const badge of badges) {
    if (user.points >= badge.minScore) {
      // Check if badge is already in earnedBadges
      if (!user.earnedBadges?.some((id) => id.equals(badge._id))) {
        user.earnedBadges = user.earnedBadges
          ? [...user.earnedBadges, badge._id]
          : [badge._id];
        assignedBadges.push(badge);
      } else {
        assignedBadges.push(badge); // Include already assigned badges in response
      }
    }
  }

  if (assignedBadges.length === 0) {
    throw new AppError(status.BAD_REQUEST, "No badges match the user's score");
  }

  user.autoAssignBadge = true;
  await user.save();
  return assignedBadges;
};

const removeBadgeFromUser = async (userId: string, badgeId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Convert badgeId string to ObjectId
  const badgeObjectId = new mongoose.Types.ObjectId(badgeId);

  // Check if badge exists in earnedBadges
  if (!user.earnedBadges?.some((id) => id.equals(badgeObjectId))) {
    throw new AppError(status.BAD_REQUEST, "User does not have this badge");
  }

  // Remove badge from earnedBadges
  user.earnedBadges = user.earnedBadges.filter(
    (id) => !id.equals(badgeObjectId)
  );

  // Disable autoAssignBadge if no badges remain
  if (user.earnedBadges.length === 0) {
    user.autoAssignBadge = false;
  }

  await user.save();

  const badge = await Badge.findById(badgeId);
  return badge;
};

const getUserEarnedBadges = async (userId: string) => {
  console.log(`Fetching badges for userId: ${userId}`);
  const user = await UserModel.findById(userId).populate("earnedBadges");
  if (!user) {
    console.log(`User not found: ${userId}`);
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (user.role !== "influencer") {
    console.log(`User ${userId} is not an influencer, role: ${user.role}`);
    return [];
  }
  console.log(`User found: ${user.email}, earnedBadges: ${JSON.stringify(user.earnedBadges)}`);
  return user.earnedBadges || [];
};

const getEligibleBadges = async (userId: string) => {
  console.log(`Fetching eligible badges for userId: ${userId}`);
  const user = await UserModel.findById(userId);
  if (!user) {
    console.log(`User not found: ${userId}`);
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (user.role !== "influencer") {
    console.log(`User ${userId} is not an influencer, role: ${user.role}`);
    return [];
  }
  const badges = await Badge.find({ minScore: { $lte: user.points } }).sort({
    minScore: 1,
  });
  console.log(`Eligible badges for ${user.email}: ${JSON.stringify(badges)}`);
  return badges;
};

export const BadgeService = {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  assignBadgeToUser,
  removeBadgeFromUser,
  getUserEarnedBadges,
  getEligibleBadges,
};