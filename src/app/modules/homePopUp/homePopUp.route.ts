import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { homePopUpValidation } from "./homePopUp.validation";
import { HomePopupController } from "./homePopUp.controller";



const router = Router();

router.post(
  "/answers",
  validateRequest(homePopUpValidation.homePopUpValidationSchema),
  HomePopupController.joinPopup
);

// router.get(
//   "/entries",
//   HomePopupController.getAllWaitlistEntries
// );

export const HomePopupRoutes = router;
