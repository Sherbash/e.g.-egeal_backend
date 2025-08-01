import status from "http-status";
import { Giveaway } from "./giveaway.model";
import AppError from "../../errors/appError";
import { IGiveaway } from "./giveaway.interface";
import { Founder } from "../founder/founder.model";
import { Types } from "mongoose";
import { findProfileByRole } from "../../utils/findUser";
import { IUser } from "../user/user.interface";

const createGiveaway = async (payload: IGiveaway, user: IUser) => {
  const profile = await findProfileByRole(user);
  payload.authorId = profile._id;

  const result = await Giveaway.create(payload);
  return result;
};

const getAllGiveaways = async () => {
  const giveaways = await Giveaway.find().populate({
    path: "authorId",
    select: "-tools",
    populate: {
      path: "userId",
      model: "User",
      select: "firstName lastName email",
    },
  });
  return giveaways;
};

const getCurrentGiveaways = async () => {
  const giveaways = await Giveaway.aggregate([
    { $sort: { createdAt: -1 } }, // Sort first for better performance
    
    // Calculate participantsCount
    {
      $addFields: {
        participantsCount: { $size: "$participants" } // Count participants
      }
    },
    
    // Only include giveaways with at least 1 participant
    {
      $match: {
        participantsCount: { $gt: 0 } // Filter: participantsCount > 0
      }
    },
    
    // Rest of the pipeline (lookups, projections, etc.)
    {
      $lookup: {
        from: "founders",
        localField: "authorId",
        foreignField: "_id",
        as: "authorId",
      },
    },
    { $unwind: "$authorId" },
    {
      $lookup: {
        from: "users",
        localField: "authorId.userId",
        foreignField: "_id",
        as: "authorId.userId",
      },
    },
    { $unwind: "$authorId.userId" },
    {
      $project: {
        title: 1,
        priceMoney: 1,
        description: 1,
        rules: 1,
        deadline: 1,
        winnerId: 1,
        participants: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        participantsCount: 1,
        authorId: {
          _id: "$authorId._id",
          userId: {
            firstName: "$authorId.userId.firstName",
            lastName: "$authorId.userId.lastName",
            email: "$authorId.userId.email",
          },
        },
      },
    },
  ]);

  return giveaways;
};

const getAllOngoingGiveaways = async () => {
  const giveaways = await Giveaway.find({ status: "ongoing" });
  // console.log("giveaways", giveaways);
  return giveaways;
};

const getGiveawayById = async (giveawayId: string) => {
  const giveaway = await Giveaway.findById(giveawayId)
    .populate({
      path: "authorId",
      populate: {
        path: "userId",
        model: "User",
        select: "firstName lastName email",
      },
    })
    .populate("winnerId", "name email")
    .populate("participants", "name email");

  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Giveaway not found");
  }

  return giveaway;
};

const updateGiveaway = async (
  giveawayId: string,
  payload: Partial<IGiveaway>,
  user: IUser
) => {
  const profile = await findProfileByRole(user);
  payload.authorId = profile._id;

  const giveaway = await Giveaway.findById(giveawayId);

  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Giveaway not found");
  }

  if (giveaway.authorId.toString() !== payload.authorId.toString()) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this giveaway"
    );
  }

  const result = await Giveaway.findByIdAndUpdate(giveawayId, payload, {
    new: true,
  });

  return result;
};

const cancelGiveaway = async (giveawayId: string, user: IUser) => {
  const profile = await findProfileByRole(user);

  const giveaway = await Giveaway.findById(giveawayId);

  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Giveaway not found");
  }

  if (giveaway.status !== "ongoing") {
    throw new AppError(
      status.BAD_REQUEST,
      "Giveaway is not ongoing and cannot be canceled"
    );
  }

  if (giveaway.authorId.toString() !== profile?._id.toString()) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to cancel this giveaway"
    );
  }

  // Soft delete by changing status
  const result = await Giveaway.findByIdAndUpdate(
    giveawayId,
    { status: "closed" },
    { new: true }
  );

  return result;
};

const getGiveawayStats = async () => {
  const stats = await Giveaway.aggregate([
    {
      $group: {
        _id: null, // Group all documents together
        totalWinners: {
          $sum: {
            $cond: [{ $ne: ["$winnerId", null] }, 1, 0], // Count giveaways with a winner
          },
        },
        totalPrizeMoney: { $sum: "$priceMoney" }, // Sum all prize money
        totalParticipants: {
          $sum: { $size: "$participants" }, // Count all participants
        },
        totalGiveaways: { $sum: 1 }, // Total giveaways count
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        totalWinners: 1,
        totalPrizeMoney: 1,
        totalParticipants: 1,
        totalGiveaways: 1,
      },
    },
  ]);

  if (!stats.length) {
    return {
      totalWinners: 0,
      totalPrizeMoney: 0,
      totalParticipants: 0,
      totalGiveaways: 0,
    };
  }

  return stats[0];
};

export const GiveawayServices = {
  createGiveaway,
  updateGiveaway,
  cancelGiveaway,
  getAllGiveaways,
  getGiveawayById,
  getGiveawayStats,
  getCurrentGiveaways,
  getAllOngoingGiveaways
};
