import express from "express";
import { CampaignController } from "./campaign.controller";
import { CampaignValidation } from "./campaign.validation";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { UserRole } from "../user/user.interface";
const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  validateRequest(CampaignValidation.createCampaignSchema),
  CampaignController.createCampaign
);

// Get all campaigns - Public
router.get("/", CampaignController.getAllCampaigns);

// Get single campaign - Public
router.get("/:id", CampaignController.getCampaignById);

// Update campaign - Founder or Admin
router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  validateRequest(CampaignValidation.updateCampaignSchema),
  CampaignController.updateCampaign
);

// Delete campaign - Founder or Admin
router.delete(
  "/:id",
  auth(UserRole.FOUNDER, UserRole.ADMIN),
  CampaignController.deleteCampaign
);

// Add influencer to campaign - Founder or Admin
router.post(
  "/:campaignId/influencers",
  auth(UserRole.FOUNDER, UserRole.ADMIN),

  validateRequest(CampaignValidation.addInfluencerSchema),
  CampaignController.addInfluencer
);

// Request to join campaign - User
router.post(
  "/:campaignId/requests",
  auth(UserRole.INFLUENCER),
  CampaignController.requestToJoinCampaign
);

// Update influencer status - Founder or Admin
router.patch(
  "/:campaignId/influencers/:influencerId/status",
  auth(UserRole.ADMIN, UserRole.FOUNDER),

  // validateRequest(CampaignValidation.updateInfluencerStatusSchema),
  CampaignController.updateInfluencerStatus
);

export const CampaignRoutes = router;
