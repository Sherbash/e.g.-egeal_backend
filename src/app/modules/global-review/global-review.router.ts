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

router.get("/get-tool-reviews/:id", ReviewController.GetToolReviews);
// Get Review by ID
router.get("/:id", ReviewController.getReviewById);
router.get("/influencer/:id", ReviewController.getReviewByInfulencerId);



// Get Reviews by User
router.get("/user/:userId", ReviewController.getReviewsByUser);

// Get Reviews by Entity (e.g., `/reviews/entity/65a1b2c3d4e5f6g7h8/story`)
router.get(
  "/entity/:entityId/:entityType",
  ReviewController.getReviewsByEntity
);

// Update Review
router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  ReviewController.updateReview
);
// Update Review status
router.patch(
  "/status/:id",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  ReviewController.updateReviewStatus
);


// Update Review
router.patch(
  "/toggle-editor-pick/:id",
  auth(UserRole.ADMIN),
  ReviewController.toggleReviewEditorPick
);

// Delete Review
router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  ReviewController.deleteReview
);


export const GlobalReviewRoutes = router;
