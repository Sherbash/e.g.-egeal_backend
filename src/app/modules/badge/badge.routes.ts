import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { badgeValidation } from "./badge.validation";
import { BadgeController } from "./badge.controller";

const router = Router();

router.post(
  "/create",
  auth(UserRole.ADMIN),
  validateRequest(badgeValidation.createBadgeSchema),
  BadgeController.createBadge
);

router.get("/get-all", BadgeController.getAllBadges);

router.get("/:id", BadgeController.getBadgeById);

router.patch(
  "/update/:id",
  auth(UserRole.ADMIN),
  validateRequest(badgeValidation.updateBadgeSchema),
  BadgeController.updateBadge
);

router.delete("/delete/:id", auth(UserRole.ADMIN), BadgeController.deleteBadge);

router.post(
  "/assign/:userId",
  auth(UserRole.ADMIN),
  BadgeController.assignBadgeToUser
);

router.delete(
  "/remove/:userId",
  auth(UserRole.ADMIN),
  BadgeController.removeBadgeFromUser
);

export const BadgeRoutes = router;
