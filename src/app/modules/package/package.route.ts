import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { PackageController } from "./package.controller";
import { PackageValidation } from "./package.validation";

const router = Router();

router.post(
  "/create-package",
  auth(UserRole.ADMIN),
  validateRequest(PackageValidation.packageValidationSchema),
  PackageController.createPackage
);

router.get("/", PackageController.getAllPackages);

router.get("/:packageId", PackageController.getPackageById);

router.delete(
  "/:packageId",
  auth(UserRole.ADMIN),
  PackageController.deletePackage
);

export const PackageRoutes = router;
