import status from "http-status";
import { IProof } from "./proof.interface";
import ProofModel, { socialPostProofModel } from "./proof.model";
import AppError from "../../../errors/appError";
import UserModel from "../../user/user.model";
import { FreePackage } from "../../gift/gift.model";
import { IUser } from "../../user/user.interface";
import { IPaginationOptions } from "../../../interface/pagination";
import { paginationHelper } from "../../../utils/paginationHelpers";
import { PostModel } from "../../post/post.model";

/**
 * Submit new proof
 */
const submitProof = async (payload: IProof, userId: string) => {
  // console.log("payload", payload)
  // console.log("userId", userId)
  const isAlreadyExists = await ProofModel.findOne({
    proofSubmittedBy: userId,
    proofType: "post",
  });

  console.log("isAlreadyExists", isAlreadyExists)
  if (isAlreadyExists) {
    throw new AppError(status.CONFLICT, "You have already submitted a proof");
  }

  const proof = await ProofModel.create({
    ...payload,
    PostId: payload.PostId,
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
  // console.log(user)
  //   console.log("proof", proof)
  // 2. Authorization check - only author or admin can update
  // const isAuthor = proof?.proofApprovedBy.toString() === user?.id?.toString();
  // const isAdmin = user.role === "admin";

  // if (!isAuthor && !isAdmin) {
  //   throw new AppError(
  //     status.FORBIDDEN,
  //     "Only post author or admin can update this post"
  //   );
  // }

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
// const getAllProofsForCampaign = async (
//   options: IPaginationOptions,
//   filters: any,
//   user: IUser
// ) => {
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(options);

//   const queryConditions: Record<string, any> = {
//     PostId: { $exists: true, $ne: null }
//   };

//   if (filters?.status) queryConditions.status = filters.status;
//   if (filters?.rewardGiven) queryConditions.rewardGiven = filters.rewardGiven;

//   // For admin users, don't filter by author
//   // For regular users, only show proofs from their own campaigns
//   let campaignMatchCondition: any = {};
//   if (user.role !== 'admin') {
//     campaignMatchCondition.authorId = user.id;
//   }

//   const proofs = await ProofModel.find(queryConditions)
//     .populate("proofSubmittedBy", "firstName lastName email") 
//     .populate({
//       path: "campaignId",
//       match: campaignMatchCondition, // Apply role-based filtering
//       populate: {
//         path: "authorId", 
//         select: "firstName lastName email",
//       },
//     })
//     .sort({ [sortBy || "createdAt"]: sortOrder || -1 })
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   // Filter out proofs where campaignId is null (due to the match condition)
//   const filteredProofs = proofs.filter(proof => proof.campaignId !== null);

//   // Count only the proofs that match our criteria
//   let countQueryConditions = { ...queryConditions };
  
//   if (user.role !== 'admin') {
//     // For regular users, only count proofs from their campaigns
//     const userCampaignIds = await PostModel.find({ authorId: user.id });
//     countQueryConditions.campaignId = { $in: userCampaignIds };
//   }

//   const total = await ProofModel.countDocuments(countQueryConditions);

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     },
//     data: filteredProofs,
//   };
// };

const getAllProofsForPost = async (
  options: IPaginationOptions,
  filters: any,
  user: IUser
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const queryConditions: Record<string, any> = {
    PostId: { $exists: true, $ne: null }
  };

  if (filters?.status) queryConditions.status = filters.status;
  if (filters?.rewardGiven) queryConditions.rewardGiven = filters.rewardGiven;

  const proofs = await ProofModel.find(queryConditions)
    .populate("proofSubmittedBy", "firstName lastName email") 
    .populate({
      path: "PostId",
      select: "title description authorId",
      match: { authorId: user.id }, // Only populate posts where author is current user
      populate: {
        path: "authorId", 
        select: "firstName lastName email",
      },
    })
    .sort({ [sortBy || "createdAt"]: sortOrder || -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Filter out proofs where PostId is null (due to the match condition)
  const filteredProofs = proofs.filter(proof => proof.PostId !== null);

  // Count only the proofs that match our criteria
  const total = await ProofModel.countDocuments({
    ...queryConditions,
    PostId: { $in: await PostModel.find({ authorId: user.id }).distinct('_id') }
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: filteredProofs,
  };
};

const socialSubmitProof = async (payload: any, userId: string) => {
  const isAlreadyExists = await socialPostProofModel.findOne({
    proofSubmittedBy: userId,
  });

  // if (isAlreadyExists) {
  //   throw new AppError(status.CONFLICT, "You have already submitted a proof");
  // }

  const proof = await socialPostProofModel.create({
    ...payload,
    proofSubmittedBy: userId,
  });

  return proof;
};

// Get All Social Proofs
const socialGetAllProofs = async () => {
  const proofs = await socialPostProofModel.find().sort({ createdAt: -1 });
  return proofs;
};

// Get Single Social Proof
const socialGetProofById = async (id: string) => {
  const proof = await socialPostProofModel.findById(id);
  if (!proof) {
    throw new AppError(status.NOT_FOUND, "Social proof not found");
  }
  return proof;
};

// Get My Social Proofs
const socialGetMyProofs = async (userId: string) => {
  const proofs = await socialPostProofModel
    .find({ proofSubmittedBy: userId })
    .sort({ createdAt: -1 });
  return proofs;
};

// Update Social Proof
const socialUpdateProof = async (id: string, userId: string, payload: any) => {
  const proof = await socialPostProofModel.findOneAndUpdate(
    { _id: id, proofSubmittedBy: userId },
    payload,
    { new: true }
  );
  if (!proof) {
    throw new AppError(
      status.NOT_FOUND,
      "Social proof not found or not authorized"
    );
  }
  return proof;
};

// Delete Social Proof
const socialDeleteProof = async (id: string, userId: string) => {
  const proof = await socialPostProofModel.findOneAndDelete({
    _id: id,
    proofSubmittedBy: userId,
  });
  if (!proof) {
    throw new AppError(
      status.NOT_FOUND,
      "Social proof not found or not authorized"
    );
  }
  return proof;
};

const socialUpdateProofStatus = async (id: string, updateStatus: string) => {
  if (!id) {
    throw new AppError(status.NOT_FOUND, " id is not found  ");
  }

  if (!updateStatus) {
    throw new AppError(status.NOT_FOUND, " status  is most be  required ");
  }

  const proof = await socialPostProofModel.findOneAndUpdate(
    { _id: id },
    {
      $set: { status: updateStatus },
    }
  );
  if (!proof) {
    throw new AppError(
      status.NOT_FOUND,
      "Social proof not found or not authorized"
    );
  }
  const updateProof = await socialPostProofModel.findOne({ _id: id });

  if (updateProof?.status === "approved") {
    const updateCoin = await UserModel.findOneAndUpdate(
      { _id: proof.proofSubmittedBy },
      { $inc: { points: 1 } }, // points field 1 করে বাড়াবে
      { new: true } // updated document return করবে
    );
  }

  return updateProof;
};

export const ProofService = {
  submitProof,
  reviewProof,
  getUserProofs,
  getAllProofsForPost,
  // getAllProofsForCampaign,
  socialSubmitProof,
  socialGetAllProofs,
  socialGetProofById,
  socialGetMyProofs,
  socialUpdateProof,
  socialDeleteProof,
  socialUpdateProofStatus,
};
