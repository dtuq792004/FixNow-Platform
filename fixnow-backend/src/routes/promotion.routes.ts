import express from "express";
import * as promotionController from "../controllers/promotion.controller";

const router = express.Router();

router.post("/", promotionController.createPromotion);
router.get("/", promotionController.getAllPromotions);
router.get("/:id", promotionController.getPromotionById);
router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);
/* validate promotion */
router.post("/validate", promotionController.validatePromotion);

export default router;