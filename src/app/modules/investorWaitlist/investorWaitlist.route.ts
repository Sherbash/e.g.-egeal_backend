// import { Router } from "express";
// import validateRequest from "../../middleware/validateRequest";
// import { InvestorWaitlistController } from "./investorWaitlist.controller";
// import { investorWaitlistValidation } from "./investorWaitlist.validation";

// const router = Router();

// router.post(
//   "/join",
//   validateRequest(investorWaitlistValidation.investorWaitlistSchema),
//   InvestorWaitlistController.joinInvestorWaitlist
// );
 
// export const InvestorWaitlistRoutes = router;


import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { InvestorWaitlistController } from "./investorWaitlist.controller";
import { investorWaitlistValidation } from "./investorWaitlist.validation";

const router = Router();

router.post(
  "/join",
  validateRequest(investorWaitlistValidation.investorWaitlistSchema),
  InvestorWaitlistController.joinInvestorWaitlist
);

export const InvestorWaitlistRoutes = router;