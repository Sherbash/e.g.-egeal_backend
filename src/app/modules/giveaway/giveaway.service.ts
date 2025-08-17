// import status from "http-status";
// import { Giveaway } from "./giveaway.model";
// import AppError from "../../errors/appError";
// import { IGiveaway } from "./giveaway.interface";
// import { IUser } from "../user/user.interface";
// import { IPaginationOptions } from "../../interface/pagination";
// import { paginationHelper } from "../../utils/paginationHelpers";

// // const createGiveaway = async (payload: IGiveaway, user: IUser) => {
// //   const result = await Giveaway.create({
// //     ...payload,
// //     authorId: user.id,
// //   });
// //   return result;
// // };
// const createGiveaway = async (payload: IGiveaway, user: IUser) => {
//   // Enforce Micro Influencer Drop Area conditions
//   const giveawayPayload = {
//     ...payload,
//     authorId: user.id,
//     priceMoney: payload.priceMoney, // Fixed $100 prize
//     isPrivate: true, // Enforce private giveaway
//     maxParticipants: 30, // Limit to 30 participants
//     inviteCode: payload.inviteCode, // Expect array of invite codes
//   };

//   // Validate invite codes (ensure unique and non-empty for private giveaways)
//   if (giveawayPayload.isPrivate && (!giveawayPayload.inviteCode || giveawayPayload.inviteCode.length === 0)) {
//     throw new AppError(status.BAD_REQUEST, "Private giveaways require at least one invite code");
//   }

//   const result = await Giveaway.create(giveawayPayload);
//   return result;
// };
// const getAllGiveaways = async () => {
//   const giveaways = await Giveaway.find()
//     .populate("authorId", "-password")
//     .populate("winnerId", "-password");
//   return giveaways;
// };

// const getAllGiveawaysByRole = async (user: IUser) => {
//   let AllGiveaways;
//   if (user?.role === "admin") {
//     AllGiveaways = await Giveaway.find()
//     .populate("authorId", "-password")
//     .populate("winnerId", "-password");
//   } else if (user?.role === "founder") {
//     AllGiveaways = await Giveaway.find({ authorId: user?.id })
//     .populate("authorId", "-password")
//     .populate("winnerId", "-password");
//   }
//   // .populate("winnerId", "-password");
//   return AllGiveaways;
// };

// const getGiveawaysWithAtLeastOneParticipant = async () => {
//   const giveaways = await Giveaway.aggregate([
//     { $sort: { createdAt: -1 } }, // Sort first for better performance

//     // Calculate participantsCount
//     {
//       $addFields: {
//         participantsCount: { $size: "$participants" }, // Count participants
//       },
//     },

//     // Only include giveaways with at least 1 participant
//     {
//       $match: {
//         participantsCount: { $gt: 0 }, // Filter: participantsCount > 0
//       },
//     },

//     // Rest of the pipeline (lookups, projections, etc.)
//     {
//       $lookup: {
//         from: "founders",
//         localField: "authorId",
//         foreignField: "_id",
//         as: "authorId",
//       },
//     },
//     { $unwind: "$authorId" },
//     {
//       $lookup: {
//         from: "users",
//         localField: "authorId.userId",
//         foreignField: "_id",
//         as: "authorId.userId",
//       },
//     },
//     { $unwind: "$authorId.userId" },
//     {
//       $project: {
//         title: 1,
//         priceMoney: 1,
//         description: 1,
//         rules: 1,
//         deadline: 1,
//         winnerId: 1,
//         participants: 1,
//         status: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         participantsCount: 1,
//         authorId: {
//           _id: "$authorId._id",
//           userId: {
//             firstName: "$authorId.userId.firstName",
//             lastName: "$authorId.userId.lastName",
//             email: "$authorId.userId.email",
//           },
//         },
//       },
//     },
//   ]);

//   return giveaways;
// };

// const getAllOngoingGiveaways = async (options: IPaginationOptions) => {
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(options);

//   // Mongoose query
//   const giveaways = await Giveaway.find({ status: "ongoing" })

//     .sort({ [sortBy]: sortOrder })
//     .skip(skip)
//     .limit(limit);

//   const total = await Giveaway.countDocuments({ status: "ongoing" });

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: giveaways,
//   };
// };

// const getGiveawayById = async (giveawayId: string) => {
//   const giveaway = await Giveaway.findById(giveawayId)
//     .populate("authorId", "-password")
//     .populate("winnerId", "-password")
//     .populate("participants", "_id userId giveawayId socialUsername, videoLink proofs isWinner submittedAt");

//   if (!giveaway) {
//     throw new AppError(status.NOT_FOUND, "Giveaway not found");
//   }

//   return giveaway;
// };
// const updateGiveaway = async (
//   giveawayId: string,
//   payload: Partial<IGiveaway>,
//   user: IUser
// ) => {
//   const giveaway = await Giveaway.findById(giveawayId);

//   if (!giveaway) {
//     throw new AppError(status.NOT_FOUND, "Giveaway not found");
//   }

//   // Only admin can update any giveaway
//   if (user?.role === "admin") {
//     // allow
//   }
//   // Founder can update only their own giveaway
//   else if (user?.role === "founder") {
//     if (giveaway.authorId.toString() !== user?.id.toString()) {
//       throw new AppError(
//         status.FORBIDDEN,
//         "You are not authorized to update this giveaway"
//       );
//     }
//   } else {
//     throw new AppError(
//       status.FORBIDDEN,
//       "You are not authorized to update this giveaway"
//     );
//   }

//   const result = await Giveaway.findByIdAndUpdate(giveawayId, payload, {
//     new: true,
//   });

//   return result;
// };

// const cancelGiveaway = async (giveawayId: string, user: IUser) => {
//   const giveaway = await Giveaway.findById(giveawayId);

//   if (!giveaway) {
//     throw new AppError(status.NOT_FOUND, "Giveaway not found");
//   }

//   if (giveaway.status !== "ongoing") {
//     throw new AppError(
//       status.BAD_REQUEST,
//       "Giveaway is not ongoing and cannot be canceled"
//     );
//   }

//   // Admin can cancel any giveaway
//   if (user?.role === "admin") {
//     // allow
//   }
//   // Founder can cancel only their own
//   else if (user?.role === "founder") {
//     if (giveaway.authorId.toString() !== user?.id.toString()) {
//       throw new AppError(
//         status.FORBIDDEN,
//         "You are not authorized to cancel this giveaway"
//       );
//     }
//   } else {
//     throw new AppError(
//       status.FORBIDDEN,
//       "You are not authorized to cancel this giveaway"
//     );
//   }

//   // Soft delete by changing status
//   const result = await Giveaway.findByIdAndUpdate(
//     giveawayId,
//     { status: "closed" },
//     { new: true }
//   );

//   return result;
// };

// const getGiveawayStats = async () => {
//   const stats = await Giveaway.aggregate([
//     {
//       $group: {
//         _id: null, // Group all documents together
//         totalWinners: {
//           $sum: {
//             $cond: [{ $ne: ["$winnerId", null] }, 1, 0], // Count giveaways with a winner
//           },
//         },
//         totalPrizeMoney: { $sum: "$priceMoney" }, // Sum all prize money
//         totalParticipants: {
//           $sum: { $size: "$participants" }, // Count all participants
//         },
//         totalGiveaways: { $sum: 1 }, // Total giveaways count
//       },
//     },
//     {
//       $project: {
//         _id: 0, // Exclude the default _id field
//         totalWinners: 1,
//         totalPrizeMoney: 1,
//         totalParticipants: 1,
//         totalGiveaways: 1,
//       },
//     },
//   ]);

//   if (!stats.length) {
//     return {
//       totalWinners: 0,
//       totalPrizeMoney: 0,
//       totalParticipants: 0,
//       totalGiveaways: 0,
//     };
//   }

//   return stats[0];
// };

// export const GiveawayServices = {
//   createGiveaway,
//   updateGiveaway,
//   cancelGiveaway,
//   getAllGiveaways,
//   getGiveawayById,
//   getGiveawayStats,
//   getGiveawaysWithAtLeastOneParticipant,
//   getAllOngoingGiveaways,
//   getAllGiveawaysByRole,
// };

import status from "http-status";
import { Giveaway } from "./giveaway.model";
import AppError from "../../errors/appError";
import { IGiveaway } from "./giveaway.interface";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../utils/paginationHelpers";

// Generate a random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase(); // e.g., "X7B4N9P2"
};

const createGiveaway = async (payload: IGiveaway, user: IUser) => {
  const giveawayPayload = {
    ...payload,
    authorId: user.id,
    priceMoney: payload.priceMoney,
    isPrivate: payload.isPrivate,
    maxParticipants: payload.maxParticipants || 30,
    inviteCode: payload.isPrivate === true ? generateInviteCode() : undefined,
  };

  // Validate invite code for private giveaways
  if (giveawayPayload.isPrivate && !giveawayPayload.inviteCode) {
    throw new AppError(
      status.BAD_REQUEST,
      "Private giveaways require an invite code"
    );
  }

  const result = await Giveaway.create(giveawayPayload);
  return result;
};

const getAllGiveaways = async (options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const queryConditions: any = {};

  const [giveaways, total] = await Promise.all([
    Giveaway.find()
      .populate("authorId", "-password")
      .populate("winnerId", "-password")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Giveaway.countDocuments(queryConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: giveaways,
  };
};

const getAllGiveawaysByRole = async (
  user: IUser,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const queryConditions: any = {};

  let allGiveaways;
  let total;

  if (user?.role === "admin") {
    allGiveaways = await Giveaway.find(queryConditions)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("authorId", "-password")
      .populate("winnerId", "-password");

    total = await Giveaway.countDocuments(queryConditions);
  } else if (user?.role === "founder") {
    allGiveaways = await Giveaway.find({ authorId: user?.id })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("authorId", "-password")
      .populate("winnerId", "-password");

    total = await Giveaway.countDocuments({ authorId: user?.id });
  } else {
    throw new AppError(status.FORBIDDEN, "Unauthorized to view giveaways");
  }
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: allGiveaways,
  };
};

const getGiveawaysWithAtLeastOneParticipant = async (
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const queryConditions: any = [
    { $sort: { createdAt: -1 } },
    {
      $addFields: {
        participantsCount: { $size: "$participants" },
      },
    },
    {
      $match: {
        participantsCount: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "authorId",
      },
    },
    { $unwind: "$authorId" },
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
          _id: 1,
          firstName: "$authorId.firstName",
          lastName: "$authorId.lastName",
          email: "$authorId.email",
        },
      },
    },
  ];
  const giveaways = await Giveaway.aggregate(queryConditions)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await Giveaway.countDocuments(queryConditions);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: giveaways,
  };
};

const getAllOngoingGiveaways = async (options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const giveaways = await Giveaway.find({ status: "ongoing" })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .populate("authorId", "-password")
    .populate("winnerId", "-password");

  const total = await Giveaway.countDocuments({ status: "ongoing" });

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: giveaways,
  };
};

const getGiveawayById = async (giveawayId: string) => {
  const giveaway = await Giveaway.findById(giveawayId)
    .populate("authorId", "-password")
    .populate("winnerId", "-password")
    .populate({
      path: "participants",
      select: "_id userId socialUsername videoLink proofs isWinner submittedAt",
      populate: {
        path: "userId", 
        select: "firstName lastName email", 
      },
    });

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
  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Giveaway not found");
  }

  if (user?.role === "admin") {
    // Allow admin to update
  } else if (user?.role === "founder") {
    if (giveaway.authorId.toString() !== user?.id.toString()) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to update this giveaway"
      );
    }
  } else {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this giveaway"
    );
  }

  // Prevent updating critical fields
  if ( payload.inviteCode) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot update invite code"
    );
  }

  const result = await Giveaway.findByIdAndUpdate(giveawayId, payload, {
    new: true,
  });
  return result;
};

const cancelGiveaway = async (giveawayId: string, user: IUser) => {
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

  if (user?.role === "admin") {
    // Allow admin to cancel
  } else if (user?.role === "founder") {
    if (giveaway.authorId.toString() !== user?.id.toString()) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to cancel this giveaway"
      );
    }
  } else {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to cancel this giveaway"
    );
  }

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
        _id: null,
        totalWinners: {
          $sum: { $cond: [{ $ne: ["$winnerId", null] }, 1, 0] },
        },
        totalPrizeMoney: { $sum: "$priceMoney" },
        totalParticipants: { $sum: { $size: "$participants" } },
        totalGiveaways: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalWinners: 1,
        totalPrizeMoney: 1,
        totalParticipants: 1,
        totalGiveaways: 1,
      },
    },
  ]);

  return stats.length
    ? stats[0]
    : {
        totalWinners: 0,
        totalPrizeMoney: 0,
        totalParticipants: 0,
        totalGiveaways: 0,
      };
};

export const GiveawayServices = {
  createGiveaway,
  updateGiveaway,
  cancelGiveaway,
  getAllGiveaways,
  getGiveawayById,
  getGiveawayStats,
  getGiveawaysWithAtLeastOneParticipant,
  getAllOngoingGiveaways,
  getAllGiveawaysByRole,
};
