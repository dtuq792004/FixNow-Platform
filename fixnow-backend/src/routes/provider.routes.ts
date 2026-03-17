import { Router } from "express";
import { updateProviderStatus, updateWorkingArea } from "../controllers/provider.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

/**
 * PROVIDER routes
 */

router.patch(
  "/status",
  authMiddleware,
  requireRole("PROVIDER"),
  updateProviderStatus
);

router.patch(
  "/working-area",
  authMiddleware,
  requireRole("PROVIDER"),
  updateWorkingArea
);

export default router;