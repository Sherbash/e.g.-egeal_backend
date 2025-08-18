// import status from "http-status";
// import { Giveaway } from "../giveaway/giveaway.model";
// import AppError from "../../errors/appError";
// import { Types } from "mongoose";
// import { Participant } from "./participant.model";
// import { IUser } from "../user/user.interface";
// import mongoose from "mongoose";
// import { IParticipant } from "./participant.interface";

// const createParticipant = async (payload: IParticipant, user: IUser) => {
//   // console.log("payload", payload);
//   // const profile = await findProfileByRole(user);
//   // payload.userId = profile?._id;
//   // console.log("payload", payload)
//   // Check if giveaway exists and is ongoing
//   const giveaway = await Giveaway.findById(payload.giveawayId);
//   if (!giveaway) {
//     throw new AppError(status.NOT_FOUND, "Giveaway not found");
//   }
//   if (giveaway.status !== "ongoing") {
//     throw new AppError(
//       status.BAD_REQUEST,
//       "This giveaway is not accepting participants"
//     );
//   }

//   // Check if user already participated
//   const existingParticipant = await Participant.findOne({
//     giveawayId: payload.giveawayId,
//     userId: user?.id,
//   });
//   if (existingParticipant) {
//     throw new AppError(
//       status.BAD_REQUEST,
//       "You have already participated in this giveaway"
//     );
//   }

//   const result = await Participant.create({
//     ...payload,
//     userId: user?.id,
//   });
//   // Add participant to giveaway
//   await Giveaway.findByIdAndUpdate(payload.giveawayId, {
//     $push: { participants: result?._id },
//   });

//   return result;
// };

// const getAllParticipants = async (giveawayId: string, userId: string) => {
//   // Verify the requesting user is the giveaway author
//   const giveaway = await Giveaway.findById(giveawayId);
//   if (!giveaway) {
//     throw new AppError(status.NOT_FOUND, "Giveaway not found");
//   }
//   // if (giveaway.authorId.toString() !== userId) {
//   //   throw new AppError(status.FORBIDDEN, "You are not authorized to view participants");
//   // }

//   return await Participant.find({ giveawayId }).populate(
//     "userId",
//     "firstName lastName email role isActive"
//   );
// };

// const getParticipant = async (participantId: string) => {

//   const participant = await Participant.findById(participantId);
//   if (!participant) {
//     throw new AppError(status.NOT_FOUND, "Participant not found");
//   }

//   // Verify the requesting user is either the participant or giveaway author
//   const giveaway = await Giveaway.findById(participant.giveawayId);
//   if (!giveaway) {
//     throw new AppError(status.NOT_FOUND, "Associated giveaway not found");
//   }

//   // console.log("Participant:", participant);

//   // const isParticipant = participant.userId.equals(
//   //   new Types.ObjectId(profile?._id)
//   // );
//   // const isAuthor = giveaway.authorId.equals(new Types.ObjectId(profile?._id));

//   // if (!isParticipant && !isAuthor) {
//   //   throw new AppError(
//   //     status.FORBIDDEN,
//   //     "You are not authorized to view this participant"
//   //   );
//   // }

//   return participant;
// };

// const pickWinner = async (giveawayId: string, user: IUser) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // Step 1: Find giveaway
//     const giveaway = await Giveaway.findById(giveawayId).session(session);
//     if (!giveaway) {
//       throw new AppError(status.NOT_FOUND, "Giveaway not found");
//     }

//     // Step 2: Authorization check
//     if (
//       user.role !== "admin" &&
//       giveaway.authorId.toString() !== user?.id.toString()
//     ) {
//       throw new AppError(
//         status.FORBIDDEN,
//         "You are not authorized to pick a winner"
//       );
//     }

//     // Step 3: Status check
//     if (giveaway.status !== "ongoing") {
//       throw new AppError(
//         status.BAD_REQUEST,
//         "Winner can only be picked for ongoing giveaways"
//       );
//     }

//     // Step 4: Get verified participants
//     const participants = await Participant.aggregate([
//       {
//         $match: {
//           giveawayId: new Types.ObjectId(giveawayId),
//         },
//       },
//       {
//         $match: {
//           proofs: {
//             $not: {
//               $elemMatch: {
//                 verified: false,
//               },
//             },
//           },
//         },
//       },
//     ]);
// // console.log("participants", participants)
//     if (participants.length === 0) {
//       throw new AppError(status.BAD_REQUEST, "No verified participants found");
//     }

//     // Step 5: Pick random winner
//     const winner =
//       participants[Math.floor(Math.random() * participants.length)];

//     // console.log("winner", winner);
//     const updatedWinner = await Participant.findByIdAndUpdate(
//       winner._id,
//       { isWinner: true },
//       { new: true, session }
//     );

//     if (!updatedWinner) {
//       throw new AppError(
//         status.INTERNAL_SERVER_ERROR,
//         "Failed to update winner"
//       );
//     }

//     // Step 7: Update giveaway
//     const updatedGiveaway = await Giveaway.findByIdAndUpdate(
//       giveawayId,
//       { winnerId: updatedWinner?.userId, status: "winner_selected" },
//       { new: true, session }
//     );

//     // console.log(updatedGiveaway);

//     // Step 8: Commit & end session
//     await session.commitTransaction();

//     return {
//       giveaway: updatedGiveaway,
//       winner: { ...winner, isWinner: true },
//     };
//   } catch (err) {
//     // Rollback only if still in transaction
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }
//     throw err;
//   } finally {
//     session.endSession(); // Always close session
//   }
// };

// export const ParticipantServices = {
//   createParticipant,
//   getAllParticipants,
//   getParticipant,
//   pickWinner,
// };

import status from "http-status";
import { Giveaway } from "../giveaway/giveaway.model";
import AppError from "../../errors/appError";
import { Types } from "mongoose";
import { Participant } from "./participant.model";
import { IUser } from "../user/user.interface";
import mongoose from "mongoose";
import { IParticipant, IProof } from "./participant.interface";
import { paginationHelper } from "../../utils/paginationHelpers";
import { IPaginationOptions } from "../../interface/pagination";

const createParticipant = async (
  payload: IParticipant & { inviteCode: string },
  user: IUser
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const giveaway = await Giveaway.findById(payload.giveawayId).session(
      session
    );
    if (!giveaway) {
      throw new AppError(status.NOT_FOUND, "Giveaway not found");
    }
    if (giveaway.status !== "ongoing") {
      throw new AppError(
        status.BAD_REQUEST,
        "This giveaway is not accepting participants"
      );
    }

    // Check participant limit
    if (giveaway.participants.length >= giveaway.maxParticipants) {
      throw new AppError(
        status.BAD_REQUEST,
        "Maximum participant limit reached"
      );
    }

    // Validate invite code for private giveaways
    if (giveaway.isPrivate) {
      if (!payload.inviteCode || payload.inviteCode !== giveaway.inviteCode) {
        throw new AppError(status.FORBIDDEN, "Invalid or missing invite code");
      }
    }

    // Check if user already participated
    const existingParticipant = await Participant.findOne({
      giveawayId: payload.giveawayId,
      userId: user?.id,
    }).session(session);
    if (existingParticipant) {
      throw new AppError(
        status.BAD_REQUEST,
        "You have already participated in this giveaway"
      );
    }

    const result = await Participant.create(
      [
        {
          ...payload,
          userId: user?.id,
        },
      ],
      { session }
    );

    await Giveaway.updateOne(
      { _id: payload.giveawayId },
      { $push: { participants: result[0]._id } },
      { session }
    );

    await session.commitTransaction();
    return result[0];
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
};

const getAllParticipants = async (
  giveawayId: string,
  user: IUser,
  options: IPaginationOptions
) => {
  const { role, id: userId } = user;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Giveaway not found");
  }

  // If not admin, check ownership
  if (role !== "admin" && giveaway.authorId.toString() !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view participants"
    );
  }

  const participants = await Participant.find({ giveawayId })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .populate("userId", "firstName lastName email role isActive");

  const total = await Participant.countDocuments({ giveawayId });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: participants,
  };
};

const getParticipant = async (participantId: string, user: IUser) => {
  const participant = await Participant.findById(participantId);
  if (!participant) {
    throw new AppError(status.NOT_FOUND, "Participant not found");
  }

  const giveaway = await Giveaway.findById(participant.giveawayId);
  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Associated giveaway not found");
  }

  // const isParticipant = participant.userId.equals(new Types.ObjectId(user.id));
  // const isAuthor = giveaway.authorId.equals(new Types.ObjectId(user.id));
  // const isAdmin = user.role === "admin";

  // if (!isParticipant && !isAuthor && !isAdmin) {
  //   throw new AppError(status.FORBIDDEN, "You are not authorized to view this participant");
  // }

  return participant;
};

const pickWinner = async (giveawayId: string, user: IUser) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const giveaway = await Giveaway.findById(giveawayId).session(session);
    if (!giveaway) {
      throw new AppError(status.NOT_FOUND, "Giveaway not found");
    }

    if (
      user.role !== "admin" &&
      giveaway.authorId.toString() !== user?.id.toString()
    ) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to pick a winner"
      );
    }

    if (giveaway.status !== "ongoing") {
      throw new AppError(
        status.BAD_REQUEST,
        "Winner can only be picked for ongoing giveaways"
      );
    }

    const participants = await Participant.aggregate([
      {
        $match: {
          giveawayId: new Types.ObjectId(giveawayId),
        },
      },
      {
        $match: {
          proofs: {
            $not: { $elemMatch: { verified: false } },
          },
        },
      },
    ]);

    if (participants.length === 0) {
      throw new AppError(status.BAD_REQUEST, "No verified participants found");
    }

    const winner =
      participants[Math.floor(Math.random() * participants.length)];

    const updatedWinner = await Participant.findByIdAndUpdate(
      winner._id,
      { isWinner: true },
      { new: true, session }
    );

    if (!updatedWinner) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to update winner"
      );
    }

    const updatedGiveaway = await Giveaway.findByIdAndUpdate(
      giveawayId,
      { winnerId: updatedWinner.userId, status: "winner_selected" },
      { new: true, session }
    );

    await session.commitTransaction();

    return {
      giveaway: updatedGiveaway,
      winner: { ...winner, isWinner: true },
    };
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
};

const verifyParticipantProof = async (
  participantId: string,
  payload: any,
  user: IUser
) => {
  console.log(payload);

  const session = await mongoose.startSession();
  session.startTransaction(); 
  try {
    // 1. Find the giveaway
    const giveaway = await Giveaway.findById(payload?.giveawayId).session(session);
    if (!giveaway) {
      throw new AppError(status.NOT_FOUND, "Giveaway not found");
    }

    // 2. Authorization check
    if (
      user.role !== "admin" &&
      giveaway.authorId.toString() !== user.id.toString()
    ) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to verify proofs"
      );
    }

    // 3. Find participant
    const participant = await Participant.findById(participantId).session(session);
    if (!participant) {
      throw new AppError(status.NOT_FOUND, "Participant not found");
    }

    // 4. Find the proof
    const proof = participant.proofs.find(
      (p) => p._id.toString() === payload?.proofId.toString()
    );
    if (!proof) {
      throw new AppError(status.NOT_FOUND, "Proof not found");
    }

    // 5. Update proof verified status
    proof.verified = payload?.verified; // true or false

    // 6. Save participant
    await participant.save({ session });

    // 7. Commit transaction
    await session.commitTransaction();
// console.log("participant", participant)
    return participant;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

export const ParticipantServices = {
  createParticipant,
  verifyParticipantProof,
  getAllParticipants,
  getParticipant,
  pickWinner,
};
