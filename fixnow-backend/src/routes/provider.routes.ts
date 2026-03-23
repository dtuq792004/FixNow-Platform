import { Router } from "express";
import { getProvider, updateProviderStatus, updateWorkingArea } from "../controllers/provider.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * PROVIDER routes
 */

router.get(
  "/me",
  authMiddleware,
  getProvider
);

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