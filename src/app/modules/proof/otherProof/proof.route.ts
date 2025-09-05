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


// ✅ Create Social Proof
router.post(
  "/create-social-proof",
  auth(UserRole.USER),
  ProofController.socialSubmitProof
);

// ✅ Get All Social Proofs
router.get(
  "/get-social-proofs",
  auth(UserRole.ADMIN),
    ProofController.socialGetAllProofs
);

// ✅ Get Single Social Proof
router.get(
  "/get-social-proof/:id",
  auth(UserRole.ADMIN),
  ProofController.socialGetProofById
);

// ✅ Get My Social Proofs
router.get(
  "/get-my-social-proofs",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER),
  ProofController.socialGetMyProofs
);

// ✅ Update Social Proof
router.patch(
  "/update-social-proof/:id",
  auth(UserRole.USER),
  ProofController.socialUpdateProof
);
router.patch(
  "/update-proof-status/:id",
  auth(UserRole.ADMIN),
  ProofController.socialUpdateProofStatus
);

// ✅ Delete Social Proof
router.delete(
  "/delete-social-proof/:id",
  auth(UserRole.ADMIN),
  ProofController.socialDeleteProof
);

export const ProofRoutes = router;