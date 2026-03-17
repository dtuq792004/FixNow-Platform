import { Router } from "express";
import { updateProviderStatus, updateWorkingArea } from "../controllers/provider.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * PROVIDER routes
 */

router.patch(
  "/status",
  authMiddleware,
  updateProviderStatus
);

router.patch(
  "/working-area",
  authMiddleware,
  updateWorkingArea
);

export default router;