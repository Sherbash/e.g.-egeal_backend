import express from "express";
import { PostController } from "./post.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { PostValidation } from "./post.validation";
import { ProofValidation } from "../proof/otherProof/proof.validation";

const router = express.Router();

// Create a post
router.post(
  "/create-post",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.ADMIN),
  validateRequest(PostValidation.postValidationSchema),
  PostController.createPost
);

router.post(
  "/:id/proofs",
  auth(UserRole.INFLUENCER, UserRole.USER),
  validateRequest(ProofValidation.submitProofSchema),
  PostController.submitProof
);

// Get all posts (optionally filtered by ?authorId=xxx)
router.get("/", PostController.getAllPosts);

// Get single post
router.get("/:id", PostController.getPost);

// Update a post
router.patch(
  "/:id",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.ADMIN, ),
  PostController.updatePost
);

// Delete a post
router.delete("/:id", auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.ADMIN, ), PostController.deletePost);

export const PostRoutes = router;
