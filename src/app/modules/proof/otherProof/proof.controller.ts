import { Request, Response } from "express";
import { ProofService } from "./proof.service";
import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { IUser } from "../../user/user.interface";
import pickOptions from "../../../utils/pick";

// User submits proof
const submitProof = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id;

  const result = await ProofService.submitProof(payload, userId);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Proof submitted successfully",
    data: result,
  });
});

// Admin reviews proof
const reviewProof = catchAsync(async (req: Request, res: Response) => {
  const { proofId } = req.params;
  const payload = req.body;
  const user = req.user;

  const result = await ProofService.reviewProof(
    proofId,
    user as IUser,
    payload
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: `Proof reviewed successfully`,
    data: result,
  });
});

// Get user's proofs
const getMyProofs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { sdfkj } = req.query;

  const result = await ProofService.getUserProofs(userId, sdfkj as string);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Proofs retrieved successfully",
    data: result,
  });
});

// Admin gets all proofs
const getAllProofsForPost = catchAsync(async (req: Request, res: Response) => {
  const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const filters = pickOptions(req.query, [
    "proofType",
    "status",
    "rewardGiven",
  ]);
  const result = await ProofService.getAllProofsForPost(
    options,
    filters,
    req.user as IUser
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "All post proofs retrieved",
    data: result,
  });
});

// const getAllProofsForCampaign = catchAsync(async (req: Request, res: Response) => {
//   const options = pickOptions(req.query, [
//     "limit",
//     "page",
//     "sortBy",
//     "sortOrder",
//   ]);
//   const filters = pickOptions(req.query, [
//     "proofType",
//     "status",
//     "rewardGiven",
//   ]);
//   const result = await ProofService.getAllProofsForCampaign(
//     options,
//     filters,
//     req.user as IUser
//   );

//    sendResponse(res, {
//     success: true,
//     statusCode: status.OK,
//     message: "All campaign proofs retrieved",
//     data: result,
//   });
// })

// Submit Social Proof
const socialSubmitProof = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id;

  const result = await ProofService.socialSubmitProof(payload, userId);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Social proof submitted successfully",
    data: result,
  });
});

// Get All Social Proofs
const socialGetAllProofs = catchAsync(async (req: Request, res: Response) => {
  console.log("req user", req.user);
  const result = await ProofService.socialGetAllProofs();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "All social proofs retrieved successfully",
    data: result,
  });
});

// Get Single Social Proof
const socialGetProofById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProofService.socialGetProofById(id);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Social proof retrieved successfully",
    data: result,
  });
});

// Get My Social Proofs
const socialGetMyProofs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ProofService.socialGetMyProofs(userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "My social proofs retrieved successfully",
    data: result,
  });
});

// Update Social Proof
const socialUpdateProof = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const payload = req.body;

  const result = await ProofService.socialUpdateProof(id, userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Social proof updated successfully",
    data: result,
  });
});

// Delete Social Proof
const socialDeleteProof = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const result = await ProofService.socialDeleteProof(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Social proof deleted successfully",
    data: result,
  });
});

const socialUpdateProofStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await ProofService.socialUpdateProofStatus(
      id,
      payload.status
    );

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Social proof status updated successfully",
      data: result,
    });
  }
);
export const ProofController = {
  submitProof,
  reviewProof,
  getMyProofs,
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
