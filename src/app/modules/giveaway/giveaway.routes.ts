import { Router } from "express";
import { GiveawayController } from "./giveaway.controller";
import { GiveawayValidation } from "./giveaway.validation";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";

const router = Router();

router.post(
  "/create-giveaway",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  validateRequest(GiveawayValidation.CreateGiveawaySchema),
  GiveawayController.createGiveaway
);
router.get(
  "/",
  // auth(UserRole.ADMIN, UserRole.FOUNDER),
  GiveawayController.getAllGiveaways
);
router.get("/stats", GiveawayController.getGiveawayStats);
router.get("/current-giveaways", GiveawayController.getCurrentGiveaways);
router.get(
  "/ongoing-giveaways",
  // auth(UserRole.ADMIN, UserRole.FOUNDER),
  GiveawayController.getAllOngoingGiveaways
);

router.get(
  "/:giveawayId",
  // auth(UserRole.ADMIN, UserRole.FOUNDER),
  GiveawayController.getGiveawayById
);

router.patch(
  "/:giveawayId",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  validateRequest(GiveawayValidation.updateGiveawaySchema),
  GiveawayController.updateGiveaway
);

router.patch(
  "/:giveawayId/cancel",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  GiveawayController.cancelGiveaway
);

export const GiveawayRoutes = router;
