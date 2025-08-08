import { Router } from "express";
import { InfluencerController } from "./influencer.controller";

const router = Router();

router.get("/",InfluencerController.getAllInfluencer);

export const InfluencerRoutes = router;
