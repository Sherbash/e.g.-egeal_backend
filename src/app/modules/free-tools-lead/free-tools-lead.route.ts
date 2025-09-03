import { Router } from "express";
import { FreeToolsLeadController } from "./free-tools-lead.controller";


const router = Router();

router.post(
  "/create-free-tools-lead",
  FreeToolsLeadController.createFreeToolsLead
)

export const FreeToolsLeadRoutes = router;