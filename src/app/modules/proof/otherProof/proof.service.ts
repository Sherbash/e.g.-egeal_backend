import status from "http-status";
import { IProof } from "./proof.interface";
import ProofModel from "./proof.model";
import AppError from "../../../errors/appError";
import UserModel from "../../user/user.model";
import { FreePackage } from "../../gift/gift.model";
import { IUser } from "../../user/user.interface";
import { IPaginationOptions } from "../../../interface/pagination";
import { paginationHelper } from "../../../utils/paginationHelpers";

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
  user: IUser,
  payload: Partial<IProof>
) => {
  const proof = await ProofModel.findById(proofId);
  if (!proof) {
    throw new AppError(status.NOT_FOUND, "Proof not found");
  }

  // 2. Authorization check - only author or admin can update
  const isAuthor = proof?.proofSubmittedBy.toString() === user?.id?.toString();
  const isAdmin = user.role === "admin";

  if (!isAuthor && !isAdmin) {
    throw new AppError(
      status.FORBIDDEN,
      "Only post author or admin can update this post"
    );
  }

  if (payload?.status === "approved") {
    await ProofModel.findOneAndUpdate(
      { _id: proofId },
      {
        $set: {
          ...payload,
          proofApprovedBy: user?.id,
          status: "approved",
          rewardGiven: true,
        },
      }
    );

    if (proof?.proofType === "social-post") {
      // ✅ Check if user already has freePackage for testimonialWall
      // const alreadyHas = await FreePackage.findOne({
      //   userId: proof?.proofSubmittedBy,
      //   type: "social-post",
      // });

      // if (!alreadyHas) {
      const freePackage = await FreePackage.create({
        userId: proof?.proofSubmittedBy,
        status: "paid",
        type: "social-post",
      });

      await UserModel.findOneAndUpdate(
        { _id: proof?.proofSubmittedBy },
        { $push: { freePackages: freePackage?._id } },
        { new: true }
      );
      // }
    }
  } else if (payload?.status === "rejected") {
    proof.status = payload.status;
    proof.adminFeedback = payload?.adminFeedback;
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
// ProofService
const getAllProofs = async (options: IPaginationOptions, filters: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const queryConditions: Record<string, any> = {};

  if (filters?.status) queryConditions.status = filters.status;
  if (filters?.proofType) queryConditions.proofType = filters.proofType;
  if (filters?.rewardGiven) queryConditions.rewardGiven = filters.rewardGiven;

  const [proofs, total] = await Promise.all([
    ProofModel.find(queryConditions)
      .populate("proofSubmittedBy", "firstName lastName email")
      .sort({ [sortBy || "createdAt"]: sortOrder || -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ProofModel.countDocuments(queryConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: proofs,
  };
};

export const ProofService = {
  submitProof,
  reviewProof,
  getUserProofs,
  getAllProofs,
};
