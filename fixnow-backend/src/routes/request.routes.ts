import { Router } from "express";
import {
  createRequestController,
  getRequestByIdController,
  getMyRequestsController,
  cancelRequestController,
  getAvailableRequestsController,
  respondRequestController,
  startServiceController,
  completeServiceController,
} from "../controllers/request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// ── Customer routes ───────────────────────────────────────────────────────────
router.post("/", authMiddleware, createRequestController);
router.get("/customer", authMiddleware, getMyRequestsController);      // must be before /:id
router.get("/:id", authMiddleware, getRequestByIdController);
router.patch("/:id/cancel", authMiddleware, cancelRequestController);

// ── Provider routes ───────────────────────────────────────────────────────────
router.get("/provider", authMiddleware, getAvailableRequestsController);
router.patch("/:id/respond", authMiddleware, respondRequestController);
router.patch("/:id/start", authMiddleware, startServiceController);
router.patch("/:id/complete", authMiddleware, completeServiceController);

export default router;
