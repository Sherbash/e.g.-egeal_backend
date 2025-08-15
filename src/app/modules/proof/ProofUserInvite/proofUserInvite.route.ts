import express from "express";
import { ProofUserInviteController } from "./proofUserInvite.controller";
import validateRequest from "../../../middleware/validateRequest";
import { ProofUserInviteValidation } from "./proofUserInvite.validation";
import auth from "../../../middleware/auth";
import { UserRole } from "../../user/user.interface";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.USER, UserRole.INFLUENCER),
  validateRequest(ProofUserInviteValidation.createProofUserInviteSchema),
  ProofUserInviteController.createProof
);
router.post("/upload-proof", ProofUserInviteController.uploadScreenshot);
router.post("/verify/:proofId",auth(UserRole.ADMIN), ProofUserInviteController.verifyAndReward);

export const ProofUserInviteRoutes = router;
