import { Router } from "express";
import { PromotionController } from "../controllers/promotion.controller";

const router = Router();

router.post("/", PromotionController.create);
router.get("/", PromotionController.getAll);
router.put("/:id", PromotionController.update);
router.delete("/:id", PromotionController.delete);

export default router;