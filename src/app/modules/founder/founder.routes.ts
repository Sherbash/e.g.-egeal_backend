import { Router } from "express";
import { FounderController } from "./founder.controller";

const router = Router();

router.get("/",FounderController.getAllFounder);

export const FounderRoutes = router;
