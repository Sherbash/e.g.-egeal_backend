import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { SubscriptionValidation } from "./packageSubscription.validation";
import { SubscriptionController } from "./packageSubscription.controller";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post(
  "/create-subscription",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.INVESTOR, UserRole.USER),
  validateRequest(SubscriptionValidation.SubscriptionValidationSchema),
  SubscriptionController.createSubscription
);

router.get(
  "/my-subscription",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.INVESTOR, UserRole.USER),
  SubscriptionController.getMySubscription
);

router.get(
  "/all-subscriptions",
auth(UserRole.ADMIN),
  SubscriptionController.getAllSubscription
);

router.get(
  "/subscriptionId/:subscriptionId",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.INVESTOR, UserRole.USER, UserRole.ADMIN),
  SubscriptionController.getSingleSubscription
);

router.patch(
  "/update/:subscriptionId",
  auth(UserRole.ADMIN),
  SubscriptionController.updateSubscription
);

router.delete(
  "/delete/:subscriptionId",
  auth(UserRole.ADMIN),
  SubscriptionController.deleteSubscription
);

router.post("/stripe/webhook", SubscriptionController.handleStripeWebhook);

export const PackageSubscriptionRoutes = router;
