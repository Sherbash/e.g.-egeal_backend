import express from "express";
import { ReputationController } from "./reputation.controller";
import auth from "../../../middleware/auth";
import { UserRole } from "../../user/user.interface";

const router = express.Router();

router.get(
  "/:influencerId/score",
//   auth(UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  ReputationController.calculateReputationScore
);

router.patch(
  "/:influencerId/update",
  auth(UserRole.ADMIN),
  ReputationController.updateReputation
);

router.post(
  "/:influencerId/campaign/:campaignId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  ReputationController.handleCampaignParticipation
);

router.post(
  "/review",
  auth(UserRole.ADMIN, UserRole.FOUNDER, UserRole.INFLUENCER),
  ReputationController.handleNewReview
);

export const ReputationRoutes = router;
