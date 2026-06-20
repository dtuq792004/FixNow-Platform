import { Router } from "express";
import {
  createRequestController,
  getRequestByIdController,
  getMyRequestsController,
  cancelRequestController,
  getAvailableRequestsController,
  getMyProviderJobsController,
  getProviderJobsController,
  getProviderJobByIdController,
  respondRequestController,
  startServiceController,
  completeServiceController,
  payLaterController,
  uploadRequestImageController,
} from "../controllers/request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { uploadImage } from "../middlewares/multer.middleware";
import { uploadImageToCloudinary } from "../middlewares/cloudinary.middleware";

const router = Router();

// ── Customer routes ───────────────────────────────────────────────────────────
router.post("/", authMiddleware, createRequestController);
router.get("/customer", authMiddleware, getMyRequestsController);

// ── Provider routes — must be BEFORE /:id to avoid param capture ─────────────
router.get("/provider", authMiddleware, roleMiddleware("PROVIDER"), getAvailableRequestsController);
router.get("/provider/jobs", authMiddleware, roleMiddleware("PROVIDER"), getProviderJobsController);
router.get("/provider/my-jobs", authMiddleware, roleMiddleware("PROVIDER"), getMyProviderJobsController);
router.get("/provider/:id", authMiddleware, roleMiddleware("PROVIDER"), getProviderJobByIdController);
router.post(
  "/provider/upload-image",
  authMiddleware,
  roleMiddleware("PROVIDER"),
  uploadImage.single("image"),
  uploadImageToCloudinary("request-completions"),
  uploadRequestImageController,
);

// ── Parameterised routes ──────────────────────────────────────────────────────
router.get("/:id", authMiddleware, getRequestByIdController);
router.patch("/:id/cancel", authMiddleware, cancelRequestController);
router.patch("/:id/respond", authMiddleware, roleMiddleware("PROVIDER"), respondRequestController);
router.patch("/:id/start", authMiddleware, roleMiddleware("PROVIDER"), startServiceController);
router.patch("/:id/complete", authMiddleware, roleMiddleware("PROVIDER"), completeServiceController);
router.patch("/:id/pay-later", authMiddleware, payLaterController);

export default router;
