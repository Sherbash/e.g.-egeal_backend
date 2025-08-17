import { Router } from "express";
import { InfluencerController } from "./influencer.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.get("/", InfluencerController.getAllInfluencer);

router.post(
  "/add-gig-info",
  auth(UserRole.INFLUENCER),
  InfluencerController.createGigPage
);
router.get("/get-my-gig-info",auth(UserRole.INFLUENCER), InfluencerController.getGigPageByUserId);

router.get("/get-gig-info/:id", InfluencerController.getGigPageById);
router.get("/get-info-by-influencerId/:influencerId", InfluencerController.getGigPageByInfluencerId);
router.get("/:username", InfluencerController.getGigPage);
router.patch(
  "/update-gig-info",
  auth(UserRole.INFLUENCER),
  InfluencerController.updateGigPage
);
router.delete(
  "/delete-gig-info",
  auth(UserRole.INFLUENCER),
  InfluencerController.deleteGigPage
);


// Upsert (Create or Update) bank details for an influencer
router.put(
  "/:influencerId/bank-details",
  // validateRequest(bankDetailsValidation), // optional validation middleware
  InfluencerController.upsertBankDetails
);

// Get bank details for an influencer
router.get("/:influencerId/bank-details", InfluencerController.getBankDetails);

// Delete bank details for an influencer
router.delete("/:influencerId/bank-details", InfluencerController.deleteBankDetails);

export const InfluencerRoutes = router;
