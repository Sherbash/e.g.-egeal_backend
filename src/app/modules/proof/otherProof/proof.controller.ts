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

  const result = await ProofService.reviewProof(proofId, user as IUser,payload);

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
const getAllProofs = catchAsync(async (req: Request, res: Response) => {

   const options = pickOptions(req.query, [
    "limit",
    "page",
    "sortBy",
    "sortOrder",
  ]);
  const filters = pickOptions(req.query, [
    "proofType",
    "status",
    "rewardGiven"
  ]);
  const result = await ProofService.getAllProofs(options, filters, req.user as IUser);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "All proofs retrieved",
    data: result,
  });
});

export const ProofController = {
  submitProof,
  reviewProof,
  getMyProofs,
  getAllProofs,
};
