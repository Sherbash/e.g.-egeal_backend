import status from "http-status";
import { IProof } from "./proof.interface";
import ProofModel, { socialPostProofModel } from "./proof.model";
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
  
  const isAlreadyExists = await ProofModel.findOne({
    proofSubmittedBy: userId,
    proofType: "post"
  })

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
const getAllProofs = async (options: IPaginationOptions, filters: any, user: IUser) => {

  
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



const socialSubmitProof = async (payload: any, userId: string) => {
  
  const isAlreadyExists = await socialPostProofModel.findOne({
    proofSubmittedBy: userId
  })

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
    throw new AppError(status.NOT_FOUND, "Social proof not found or not authorized");
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
    throw new AppError(status.NOT_FOUND, "Social proof not found or not authorized");
  }
  return proof;
};


const socialUpdateProofStatus = async (id: string,updateStatus:string) => {
  if(!id){
    throw new AppError(status.NOT_FOUND, " id is not found  ");
  }

  if(!updateStatus){
    throw new AppError(status.NOT_FOUND, " status  is most be  required ");
  }

  
  const proof = await socialPostProofModel.findOneAndUpdate(
  {_id:id},{
    $set:{status:updateStatus}
  }
  );
  if (!proof) {
    throw new AppError(status.NOT_FOUND, "Social proof not found or not authorized");
  }
const updateProof=await socialPostProofModel.findOne({_id:id})

if(updateProof?.status==="approved"){
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
  getAllProofs,
  socialSubmitProof,
  socialGetAllProofs,
  socialGetProofById,
  socialGetMyProofs,
  socialUpdateProof,
  socialDeleteProof,
  socialUpdateProofStatus
};
