import { Router } from "express";
import { EmailSubscriptionController } from "./subscription.controller";
import validateRequest from "../../middleware/validateRequest";
import { subscriptionValidation } from "./subscription.validation";

const router = Router();

router.post(
  "/subscribe",
  validateRequest(subscriptionValidation.emailSubscriptionSchema),
  EmailSubscriptionController.subscribe
);

export const EmailSubscriptionRoutes = router;
