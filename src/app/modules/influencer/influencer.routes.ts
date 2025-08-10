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
router.get("/get-gig-info/:id", InfluencerController.getGigPageById);
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

export const InfluencerRoutes = router;
