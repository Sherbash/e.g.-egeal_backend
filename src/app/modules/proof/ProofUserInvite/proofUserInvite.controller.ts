import { Request, Response } from "express";
import { ProofUserInviteService } from "./proofUserInvite.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

const createProof = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const inviter = req.user?.id; 

  const result = await ProofUserInviteService.createProofUserInvite(inviter, payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Proof user invite created successfully",
    data: result,
  });
});

const uploadScreenshot = catchAsync(async (req: Request, res: Response) => {
  const { proofId, screenshotUrl } = req.body;

  const result = await ProofUserInviteService.uploadProofScreenshot(proofId, screenshotUrl);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Screenshot uploaded successfully",
    data: result,
  });
});

const verifyAndReward = catchAsync(async (req: Request, res: Response) => {
const proofId = req.params.proofId;
  const result = await ProofUserInviteService.verifyProofAndReward(proofId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Proof verified and reward given",
    data: result,
  });
});

export const ProofUserInviteController = {
  createProof,
  uploadScreenshot,
  verifyAndReward,
};
