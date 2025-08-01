import { Router } from "express";
import { PromotionController } from "./promotion.controller";


const router = Router();

router.post("/", 
    PromotionController.createPromotion);
router.get("/",
     PromotionController.getAllPromotions);
router.get("/:id",
     PromotionController.getPromotionById);
router.patch("/:id",
     PromotionController.updatePromotion);
router.delete("/:id",
     PromotionController.deletePromotion);

export const PromotionRoutes = router;