import { Router } from "express";
import {
  createRequestController,
  getRequestByIdController,
  getMyRequestsController,
  cancelRequestController,
  getAvailableRequestsController,
  getMyProviderJobsController,
  getProviderJobByIdController,
  respondRequestController,
  startServiceController,
  completeServiceController,
  payLaterController,
} from "../controllers/request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// ── Customer routes ───────────────────────────────────────────────────────────
router.post("/", authMiddleware, createRequestController);
router.get("/customer", authMiddleware, getMyRequestsController);

// ── Provider routes — must be BEFORE /:id to avoid param capture ─────────────
router.get("/provider", authMiddleware, getAvailableRequestsController);
router.get("/provider/my-jobs", authMiddleware, getMyProviderJobsController);
router.get("/provider/:id", authMiddleware, getProviderJobByIdController);

// ── Parameterised routes ──────────────────────────────────────────────────────
router.get("/:id", authMiddleware, getRequestByIdController);
router.patch("/:id/cancel", authMiddleware, cancelRequestController);
router.patch("/:id/respond", authMiddleware, respondRequestController);
router.patch("/:id/start", authMiddleware, startServiceController);
router.patch("/:id/complete", authMiddleware, completeServiceController);
router.patch("/:id/pay-later", authMiddleware, payLaterController);

export default router;
