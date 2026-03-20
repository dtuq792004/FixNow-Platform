import { Router } from "express";
import express from "express";
import {
  createRequestController,
  getMyRequestsController,
  cancelRequestController,
  getAvailableRequestsController,
  respondRequestController,
  startServiceController,
  completeServiceController
  // confirmCompletionController,
  // providerCancelRequestController,
} from "../controllers/request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// //Customer routes
router.post("/", authMiddleware, createRequestController);

router.get("/customer", authMiddleware, getMyRequestsController);
router.patch("/:id/cancel", authMiddleware, cancelRequestController);
// router.patch('/:id/confirm', authMiddleware, confirmCompletionController);
// //Provider routes
router.get("/provider", authMiddleware, getAvailableRequestsController);
router.patch("/:id/respond", authMiddleware, respondRequestController);
router.patch("/:id/start", authMiddleware, startServiceController);
router.patch("/:id/complete", authMiddleware, completeServiceController);
// router.patch('/:id/provider-cancel', authMiddleware, providerCancelRequestController);
export default router;
