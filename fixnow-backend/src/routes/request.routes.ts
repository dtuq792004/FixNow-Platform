import { Router } from "express";
import { RequestController } from "../controllers/request.controller";

const router = Router();

router.post("/:id/complete", RequestController.providerComplete);
router.post("/:id/confirm", RequestController.customerConfirm);

export default router;