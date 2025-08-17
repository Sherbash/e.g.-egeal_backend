// payout.routes.ts
import { Router } from "express";
import { PayoutControllers } from "./payout.controller";
import validateRequest from "../../middleware/validateRequest";
import { payoutValidation } from "./payout.validation";

const router = Router();

router.post(
  "/request",
//   validateRequest(payoutValidation.payoutRequestSchema),
  PayoutControllers.createPayoutRequest
);

router.get(
  "/requests",
  PayoutControllers.getAllPayoutRequests
);

export const PayoutRoutes = router;
