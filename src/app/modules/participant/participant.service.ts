import status from "http-status";
import { Giveaway } from "../giveaway/giveaway.model";
import AppError from "../../errors/appError";
import { Types } from "mongoose";
import { Participant } from "./participant.model";
import { IUser } from "../user/user.interface";
import mongoose from "mongoose";
import { IParticipant } from "./participant.interface";
import { paginationHelper } from "../../utils/paginationHelpers";
import { IPaginationOptions } from "../../interface/pagination";
import { sendEmail } from "../../utils/emailHelper";
import UserModel from "../user/user.model";

const createParticipant = async (payload: any, user: IUser) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Giveaway validation
    const giveaway = await Giveaway.findById(payload.giveawayId)
      .session(session)
      .select("status isPrivate inviteCode maxParticipants participants");

    if (!giveaway) throw new AppError(status.NOT_FOUND, "Giveaway not found");
    if (giveaway.status !== "ongoing") {
      throw new AppError(status.BAD_REQUEST, "This giveaway is not active");
    }

    // Deadline check
    if (giveaway.deadline && new Date() > giveaway.deadline) {
      throw new AppError(status.BAD_REQUEST, "This giveaway deadline is over");
    }

    if (giveaway.participants.length >= giveaway.maxParticipants) {
      throw new AppError(
        status.BAD_REQUEST,
        `Max participant limit reached (${giveaway.maxParticipants})`
      );
    }
    if (giveaway.isPrivate && payload.inviteCode !== giveaway.inviteCode) {
      throw new AppError(status.FORBIDDEN, "Invalid invite code");
    }

    // 2. Already participated?
    const existing = await Participant.findOne({
      giveawayId: payload.giveawayId,
      userId: user.id,
    }).session(session);
    if (existing) {
      throw new AppError(status.BAD_REQUEST, "Already participated");
    }

    // 3. Build proofs array from frontend
    const proofs = [
      // Default rules from frontend
      ...(payload.defaultRules || []).map((rule: any) => ({
        ruleId: rule._id,
        ruleTitle: rule.ruleTitle,
        imageUrl: rule.imageUrl || null,
        verified: !!user.verifiedDefaultRules,
        isDefaultRule: true,
      })),
      // Custom proofs
      ...(payload.proofs || []).map((proof: any) => ({
        ...proof,
        verified: false,
        isDefaultRule: false,
      })),
    ];

    // 4. Create participant
    const [newParticipant] = await Participant.create(
      [
        {
          giveawayId: payload.giveawayId,
          userId: user.id,
          socialUsername: payload.socialUsername,
          videoLink: payload.videoLink,
          proofs,
        },
      ],
      { session }
    );

    // 5. Update giveaway participant list
    await Giveaway.updateOne(
      { _id: payload.giveawayId },
      { $push: { participants: newParticipant._id } },
      { session }
    );

    // 6. Send email (non-blocking)
    try {
      await sendEmail(
        user.email,
        "🎉 Successfully Joined Giveaway",
        generateJoinEmailTemplate(user.firstName)
      );
    } catch (err) {
      console.error("Email failed:", err);
    }

    await session.commitTransaction();
    return newParticipant;
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const verifyParticipantProof = async (
  participantId: string,
  payload: any,
  user: IUser
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Giveaway check
    const giveaway = await Giveaway.findById(payload?.giveawayId).session(
      session
    );
    if (!giveaway) throw new AppError(status.NOT_FOUND, "Giveaway not found");

    // 2. Participant check
    const participant = await Participant.findById(participantId).session(
      session
    );
    if (!participant)
      throw new AppError(status.NOT_FOUND, "Participant not found");

    // 3. Find proof
    const proof = participant.proofs.find(
      (item: any) => item._id?.toString() === payload.proofId
    );
    if (!proof) throw new AppError(status.NOT_FOUND, "Proof not found");

    // 4. Update status
    const wasVerified = proof.verified;
    proof.verified = payload.verified;

    // 5. Verification logic
    if (payload.verified && !wasVerified) {
      if (proof.isDefaultRule) {
        const userDoc = await UserModel.findById(participant.userId).session(
          session
        );
        if (userDoc && !userDoc.verifiedDefaultRules) {
          userDoc.verifiedDefaultRules = true;
          userDoc.points += 1;
          await userDoc.save({ session });
        }
      }
      // else {
      //   // custom rule হলে সবসময় point বাড়বে
      //   await UserModel.findByIdAndUpdate(
      //     participant.userId,
      //     { $inc: { points: 1 } },
      //     { session }
      //   );
      // }
    }

    await participant.save({ session });
    await session.commitTransaction();

    return participant;
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// Helper function for email template
const generateJoinEmailTemplate = (firstName: string) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #FF5722; color: white; padding: 15px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🎉 Successfully Joined a Giveaway</h1>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">
            Hello <strong>${firstName || "User"}</strong>,
          </p>
          <p style="font-size: 15px; color: #555;">
            You have successfully joined the giveaway!  
            You can now view your participation and track updates from your dashboard.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${
              process.env.CLIENT_URL
            }/dashboard/influencer/participant" style="background-color: #FF5722; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Your Giveaways
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            If you have any questions, feel free to reply to this email.  
          </p>
          <p style="font-size: 14px; color: #333; margin-top: 20px;">
            Best regards,  
            <br>
            <strong>Egeal AI Hub Team</strong>
          </p>
        </div>
      </div>
    </div>
  `;
};
// const verifyParticipantProof = async (
//   participantId: string,
//   payload: any,
//   user: IUser
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     // 1. Find the giveaway
//     const giveaway = await Giveaway.findById(payload?.giveawayId).session(
//       session
//     );
//     if (!giveaway) {
//       throw new AppError(status.NOT_FOUND, "Giveaway not found");
//     }

//     // 2. Authorization check (commented out but should be implemented)
//     // if (user.role !== "admin" && giveaway.authorId.toString() !== user.id.toString()) {
//     //   throw new AppError(status.FORBIDDEN, "You are not authorized to verify proofs");
//     // }

//     // 3. Find participant
//     const participant = await Participant.findById(participantId).session(
//       session
//     );
//     if (!participant) {
//       throw new AppError(status.NOT_FOUND, "Participant not found");
//     }

//     // 4. Find the proof inside proofs array
//     const proof = participant.proofs.find(
//       (item: any) => item._id?.toString() === payload.proofId
//     ) as any;

//     if (!proof) {
//       console.log("Available proofs:", participant?.proofs);
//       throw new AppError(status.NOT_FOUND, "Proof not found");
//     }

//     // 5. Get default rules to check if this is a default rule
//     // const defaultRuleDoc = await DefaultRule.findOne().session(session);
//     // const defaultRules = defaultRuleDoc?.rules || [];

//     // 6. Update verified status
//     const wasVerified = proof.verified;
//     proof.verified = payload.verified;

//     console.log("all proofs", proof);
//     // 7. Handle verification logic
//     if (payload.verified && !wasVerified) {
//       // Check if this is a default rule
//       const isDefaultRule = defaultRules.includes(proof.ruleTitle);
//       // console.log("Is default rule:", isDefaultRule)

//       if (isDefaultRule) {
//         // Update user's global verification status
//         await UserModel.findByIdAndUpdate(
//           participant.userId,
//           { verifiedDefaultRules: true },
//           { session }
//         );
//       }

//       // Always increment points for verified proofs
//       await UserModel.findByIdAndUpdate(
//         participant.userId,
//         { $inc: { points: 1 } },
//         { session, new: true }
//       );
//     } else if (!payload.verified && wasVerified) {
//       // Handle case where verification is removed
//       // Note: We might want to decrement points and handle default rule status
//       // This is more complex and depends on business rules
//     }

//     // 8. Save participant document
//     await participant.save({ session });

//     // 9. Commit transaction
//     await session.commitTransaction();

//     return participant;
//   } catch (error) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

const getGiveawaysByUser = async (userId: string) => {
  // Find all participant entries for this user
  const participants = await Participant.find({ userId })
    .populate({
      path: "giveawayId",
      select: "title description startDate endDate status maxParticipants",
    })
    .lean();

  // Map to just giveaway details if needed
  const giveaways = participants.map((p) => p.giveawayId);

  return giveaways;
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
  // if (role !== "admin" && giveaway.authorId.toString() !== userId) {
  //   throw new AppError(
  //     status.FORBIDDEN,
  //     "You are not authorized to view participants"
  //   );
  // }

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

// const verifyParticipantProof = async (
//   participantId: string,
//   payload: any,
//   user: IUser
// ) => {
//   console.log(payload);

//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     // 1. Find the giveaway
//     const giveaway = await Giveaway.findById(payload?.giveawayId).session(
//       session
//     );
//     if (!giveaway) {
//       throw new AppError(status.NOT_FOUND, "Giveaway not found");
//     }

//     // 2. Authorization check
//     // if (
//     //   user.role !== "admin" &&
//     //   giveaway.authorId.toString() !== user.id.toString()
//     // ) {
//     //   throw new AppError(
//     //     status.FORBIDDEN,
//     //     "You are not authorized to verify proofs"
//     //   );
//     // }

//     // 3. Find participant
//     const participant = await Participant.findById(participantId).session(
//       session
//     );
//     if (!participant) {
//       throw new AppError(status.NOT_FOUND, "Participant not found");
//     }

//     // 2. Find the proof inside proofs array
//     const proof = participant.proofs.find(
//       (item: any) => item._id?.toString() === payload.proofId
//     ) as any;

//     if (!proof) {
//       console.log("Available proofs:", participant?.proofs);
//       throw new AppError(status.NOT_FOUND, "Proof not found");
//     }

//     // 3. Update verified status
//     proof.verified = payload.verified; // true/false

//     // 4. Save participant document (subdocument update)
//     await participant.save({ session });
//     if (proof && proof.verified) {
//       const result = await UserModel.findOneAndUpdate(
//         { _id: participant.userId },
//         { $inc: { points: 1 } },
//         { new: true }
//       );
//       console.log("Updated user points:", result);
//     }
//     // 7. Commit transaction
//     await session.commitTransaction();

//     console.log(participant);
//     // console.log("participant", participant)
//     return participant;
//   } catch (error) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

export const ParticipantServices = {
  createParticipant,
  getGiveawaysByUser,
  verifyParticipantProof,
  getAllParticipants,
  getParticipant,
  pickWinner,
};
