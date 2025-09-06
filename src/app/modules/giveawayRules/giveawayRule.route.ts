import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { GiveawayRuleController } from "./giveawayRules.controller";

const router = Router();


router.post(
  "/",
  auth(UserRole.ADMIN),
  GiveawayRuleController.createRule
);
router.get(
  "/",
  GiveawayRuleController.getAllRules
);

export const GiveawayRuleRoutes = router;