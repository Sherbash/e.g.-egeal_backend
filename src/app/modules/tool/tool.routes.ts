import { Router } from "express";
import { ToolControllers } from "./tool.controller";
import validateRequest from "../../middleware/validateRequest";
import { toolValidation } from "./tool.validation";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  validateRequest(toolValidation.createToolZodSchema),
  ToolControllers.createTool
);
router.get(
  "/",

  ToolControllers.getAllTools
);
router.get(
  "/by-toolid/:toolId",

  ToolControllers.getSingleToolByToolId
);

router.get(
  "/:id",

  ToolControllers.getSingleTool
);
router.patch(
  "/:id",
  auth(UserRole.FOUNDER, UserRole.ADMIN),
  validateRequest(toolValidation.updateToolZodSchema),
  ToolControllers.updateTool
);
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.FOUNDER),
  ToolControllers.deleteTool
);

export const ToolRoutes = router;
