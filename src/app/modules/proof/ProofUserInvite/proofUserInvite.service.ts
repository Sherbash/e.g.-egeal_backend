import status from "http-status";
import ProofUserInviteModel from "./proofUserInvite.model";
import AppError from "../../../errors/appError";
import UserModel from "../../user/user.model";
import { IProofUserInvite } from "./proofUserInvite.interface";
import { IUser } from "../../user/user.interface";
import { Types } from "mongoose";

const createProofUserInvite = async (
  inviter: Types.ObjectId,
  payload: IProofUserInvite
) => {

  if (payload?.invitedUsers?.length >= 3) {
    for (const invitedUser of payload?.invitedUsers) {

      const user = await UserModel.findOne({
        email: invitedUser?.email,
        isActive: true,
      });
      if (!user) {
        throw new AppError(status.NOT_FOUND, "Invalid invited user list");
      }

      console.log(user?.referredBy?.toString(), inviter.toString())
      if (user?.referredBy?.toString() !== inviter.toString()) {
        throw new AppError(status.BAD_REQUEST, "not match");
      }
    }
  } else {
    throw new AppError(status.NOT_FOUND, "At least 3 invited users required");
  }

  const existingProof = await ProofUserInviteModel.findOne({
    inviter,
  })

  if (existingProof) {
    throw new AppError(status.BAD_REQUEST, "Proof already exists");
  }
  const proof = await ProofUserInviteModel.create({
    inviter,
    invitedUsers: payload.invitedUsers,
    proofScreenshot: payload.proofScreenshot,
  });

  return proof;
};

const uploadProofScreenshot = async (
  proofId: string,
  screenshotUrl: string
) => {
  const proof = await ProofUserInviteModel.findByIdAndUpdate(
    proofId,
    { proofScreenshot: screenshotUrl },
    { new: true }
  );

  if (!proof) throw new AppError(status.NOT_FOUND, "Proof not found");

  return proof;
};

const verifyProofAndReward = async (proofId: string) => {
  const proof = await ProofUserInviteModel.findById(proofId);

  if (!proof) throw new AppError(status.NOT_FOUND, "Proof not found");
  if (proof.confirmed)
    throw new AppError(status.BAD_REQUEST, "Already verified");

  proof.confirmed = true;
  if (proof.confirmed) {
    await UserModel.findByIdAndUpdate(proof.inviter, {
      freePackage: "paid",
    });
    proof.rewardGiven = true;
  }

  await proof.save();
  return proof;
};

export const ProofUserInviteService = {
  createProofUserInvite,
  uploadProofScreenshot,
  verifyProofAndReward,
};
