import express from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { ReviewController } from "./global-review.contllors";
const router = express.Router();

// Create Review
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  ReviewController.createReview
);


router.get(
  "/",
  ReviewController.getAllReview
);

// Update Review
router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  ReviewController.updateReview
);

// Delete Review
router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  ReviewController.deleteReview
);

// Get Review by ID
router.get("/:id", ReviewController.getReviewById);

// Get Reviews by User
router.get("/user/:userId", ReviewController.getReviewsByUser);

// Get Reviews by Entity (e.g., `/reviews/entity/65a1b2c3d4e5f6g7h8/story`)
router.get(
  "/entity/:entityId/:entityType",
  ReviewController.getReviewsByEntity
);

export const GlobalReviewRoutes = router;
