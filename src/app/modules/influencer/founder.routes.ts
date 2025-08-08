import { Router } from "express";
import { InfluencerController } from "./founder.controller";

const router = Router();

router.get("/",InfluencerController.getAllInfluencer);

export const InfluencerRoutes = router;
