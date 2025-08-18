import express from "express";
import { ProofController } from "./proof.controller";
import validateRequest from "../../../middleware/validateRequest";
import auth from "../../../middleware/auth";
import { UserRole } from "../../user/user.interface";
import { ProofValidation } from "./proof.validation";

const router = express.Router();

// User routes
router.post(
  "/submit",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  // validateRequest(ProofValidation.submitProofSchema),
  ProofController.submitProof
);

router.get(
  "/my-proofs",
//   auth(),
  ProofController.getMyProofs
);

// Admin routes
router.patch(
  "/review/:proofId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
//   validateRequest(ProofValidation.reviewProofSchema),
  ProofController.reviewProof
);

router.get(
  "/",
  // auth(UserRole.ADMIN, UserRole.FOUNDER),
  ProofController.getAllProofs
);

export const ProofRoutes = router;