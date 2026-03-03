import { Router } from "express";
import { ServiceRequestController } from "../controllers/serviceRequest.controller";

const router = Router();

router.post("/:id/complete", ServiceRequestController.providerComplete);
router.post("/:id/confirm", ServiceRequestController.customerConfirm);

export default router;