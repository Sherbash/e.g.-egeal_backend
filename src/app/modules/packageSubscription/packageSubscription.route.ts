import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { SubscriptionValidation } from "./packageSubscription.validation";
import { SubscriptionController } from "./packageSubscription.controller";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post(
  "/create-subscription",
  auth(UserRole.INFLUENCER, UserRole.FOUNDER, UserRole.INVESTOR, UserRole.USER, UserRole.ADMIN),
  validateRequest(SubscriptionValidation.SubscriptionValidationSchema),
  SubscriptionController.createSubscription
);

router.get("/my-subscription", SubscriptionController.getMySubscription);

router.get(
  "/",
  auth(
    UserRole.ADMIN,
    UserRole.FOUNDER,
    UserRole.INVESTOR,
    UserRole.USER,
    UserRole.INFLUENCER
  ),
  SubscriptionController.getAllSubscription
);

router.get("/:subscriptionId", SubscriptionController.getSingleSubscription);

router.put("/:subscriptionId", SubscriptionController.updateSubscription);

router.delete("/:subscriptionId", SubscriptionController.deleteSubscription);

router.post("/stripe/webhook", SubscriptionController.handleStripeWebhook);

export const PackageSubscriptionRoutes = router;
