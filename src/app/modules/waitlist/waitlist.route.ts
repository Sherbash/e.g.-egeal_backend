import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { waitlistValidation } from "./waitlist.validation";
import { WaitlistController } from "./waitlist.controller";


const router = Router();

router.post(
  "/join",
  validateRequest(waitlistValidation.waitlistSchema),
  WaitlistController.joinWaitlist
);

router.get(
  "/entries",
  WaitlistController.getAllWaitlistEntries
);

export const WaitlistRoutes = router;
