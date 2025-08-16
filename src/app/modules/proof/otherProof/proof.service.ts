import status from "http-status";
import { IProof } from "./proof.interface";
import ProofModel from "./proof.model";
import AppError from "../../../errors/appError";
import UserModel from "../../user/user.model";
import { FreePackage } from "../../gift/gift.model";

/**
 * Submit new proof
 */
const submitProof = async (payload: IProof, userId: string) => {
  const proof = await ProofModel.create({
    ...payload,
    proofSubmittedBy: userId,
  });

  return proof;
};

/**
 * Admin approves/rejects proof
 */
const reviewProof = async (
  proofId: string,
  adminId: string,
  payload: Partial<IProof>,
) => {
  const proof = await ProofModel.findById(proofId);
  if (!proof) {
    throw new AppError(status.NOT_FOUND, "Proof not found");
  }

  if (payload?.status === "approved") {
    await ProofModel.findOneAndUpdate(
      { _id: proofId },
      {
        $set: {
          ...payload,
          proofApprovedBy: adminId,
          status: "approved",
          rewardGiven: true,
        },
      }
    );

    const freePackage = await FreePackage.create({
      userId: payload?.proofSubmittedBy,
      status: "paid",
      type: "social-post",
    });

    await UserModel.findOneAndUpdate(
      { _id: payload?.proofSubmittedBy },
      { $push: { freePackages: freePackage?._id } },
      { new: true }
    );
  } else if (payload?.status === "rejected") {
    proof.status = payload.status;
    proof.adminFeedback = payload.adminFeedback;
  }

  await proof.save();
  return proof;
};

/**
 * Get proofs by user
 */
const getUserProofs = async (userId: string, statusFilter?: string) => {
  //   const filter: any = { proofSubmittedBy: userId };
  //   if (statusFilter) {
  //     filter.status = statusFilter;
  //   }
  //   return ProofModel.find(filter).sort({ createdAt: -1 });
};

/**
 * Get all proofs (admin)
 */
const getAllProofs = async (filters: {
  //   status?: string;
  //   proofType?: string;
  //   userId?: string;
}) => {
  //   return ProofModel.find(filters)
  //     .populate("proofSubmittedBy", "firstName lastName email")
  //     .populate("approvedBy", "firstName lastName")
  //     .sort({ createdAt: -1 });
};

export const ProofService = {
  submitProof,
  reviewProof,
  getUserProofs,
  getAllProofs,
};
