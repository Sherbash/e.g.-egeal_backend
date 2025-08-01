import status from "http-status";
import { Giveaway } from "../giveaway/giveaway.model";
import AppError from "../../errors/appError";
import { Types } from "mongoose";
import { Participant } from "./participant.model";
import { IUser } from "../user/user.interface";
import mongoose from "mongoose";
import { IParticipant } from "./participant.interface";
import { findProfileByRole } from "../../utils/findUser";

const createParticipant = async (payload: IParticipant, user: IUser) => {

  // console.log("payload", payload);
  const profile = await findProfileByRole(user);
  payload.userId = profile?._id;

  // Check if giveaway exists and is ongoing
  const giveaway = await Giveaway.findById(payload.giveawayId);
  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Giveaway not found");
  }
  if (giveaway.status !== "ongoing") {
    throw new AppError(
      status.BAD_REQUEST,
      "This giveaway is not accepting participants"
    );
  }

  // Check if user already participated
  const existingParticipant = await Participant.findOne({
    giveawayId: payload.giveawayId,
    userId: payload.userId,
  });
  if (existingParticipant) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already participated in this giveaway"
    );
  }

  const result = await Participant.create(payload);

  // Add participant to giveaway
  await Giveaway.findByIdAndUpdate(payload.giveawayId, {
    $push: { participants: result._id },
  });

  return result;
};

const getAllParticipants = async (giveawayId: string, userId: string) => {
  // Verify the requesting user is the giveaway author
  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Giveaway not found");
  }
  // if (giveaway.authorId.toString() !== userId) {
  //   throw new AppError(status.FORBIDDEN, "You are not authorized to view participants");
  // }

  return await Participant.find({ giveawayId }).populate(
    "userId",
    "name email image"
  );
};

const getParticipant = async (participantId: string, user: IUser) => {
  const profile = await findProfileByRole(user);
  
  const participant = await Participant.findById(participantId)
  if (!participant) {
    throw new AppError(status.NOT_FOUND, "Participant not found");
  }


  // Verify the requesting user is either the participant or giveaway author
  const giveaway = await Giveaway.findById(participant.giveawayId);
  if (!giveaway) {
    throw new AppError(status.NOT_FOUND, "Associated giveaway not found");
  }

  // console.log("Participant:", participant);

  // const isParticipant = participant.userId.equals(
  //   new Types.ObjectId(profile?._id)
  // );
  // const isAuthor = giveaway.authorId.equals(new Types.ObjectId(profile?._id));

  // if (!isParticipant && !isAuthor) {
  //   throw new AppError(
  //     status.FORBIDDEN,
  //     "You are not authorized to view this participant"
  //   );
  // }

  return participant;
};

const pickWinner = async (giveawayId: string, user: IUser) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const profile = await findProfileByRole(user);
    // payload.userId = profile?._id;

    // Step 1: Find giveaway
    const giveaway = await Giveaway.findById(giveawayId).session(session);
    if (!giveaway) {
      throw new AppError(status.NOT_FOUND, "Giveaway not found");
    }

    // Step 2: Authorization check
    if (
      user.role !== "admin" &&
      giveaway.authorId.toString() !== profile?._id.toString()
    ) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to pick a winner"
      );
    }

    // Step 3: Status check
    if (giveaway.status !== "ongoing") {
      throw new AppError(
        status.BAD_REQUEST,
        "Winner can only be picked for ongoing giveaways"
      );
    }

    // Step 4: Get verified participants
    const participants = await Participant.aggregate([
      {
        $match: {
          giveawayId: new Types.ObjectId(giveawayId),
          "proofs.verified": { $not: { $elemMatch: { verified: false } } },
        },
      },
    ]);

    if (participants.length === 0) {
      throw new AppError(status.BAD_REQUEST, "No verified participants found");
    }

    // Step 5: Pick random winner
    const winner =
      participants[Math.floor(Math.random() * participants.length)];

    // Step 6: Update winner participant
    await Participant.findByIdAndUpdate(
      winner._id,
      { isWinner: true },
      { session }
    );

    // Step 7: Update giveaway
    const updatedGiveaway = await Giveaway.findByIdAndUpdate(
      giveawayId,
      { winnerId: winner.userId, status: "winner_selected" },
      { new: true, session }
    );

    // Step 8: Commit & end session
    await session.commitTransaction();

    return {
      giveaway: updatedGiveaway,
      winner: { ...winner, isWinner: true },
    };
  } catch (err) {
    // Rollback only if still in transaction
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession(); // Always close session
  }
};

export const ParticipantServices = {
  createParticipant,
  getAllParticipants,
  getParticipant,
  pickWinner,
};
