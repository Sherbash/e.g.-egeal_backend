import express from "express";
import { StoryController } from "./storyPoll.controller";
import validateRequest from "../../middleware/validateRequest";
import { StoryValidation } from "./storyPoll.validation";
import { UserRole } from "../user/user.interface";
import auth from "../../middleware/auth";

const router = express.Router();

// Public routes
router.get("/:id", StoryController.getStory);

// Protected routes (require authentication)
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  validateRequest(StoryValidation.createStorySchema),
  StoryController.createStory
);
router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  StoryController.updateStory
);
router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  StoryController.deleteStory
);

// Poll voting
router.post(
  "/:id/vote",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  validateRequest(StoryValidation.voteSchema),
  StoryController.voteOnPoll
);

export const StoryRoutes = router;
