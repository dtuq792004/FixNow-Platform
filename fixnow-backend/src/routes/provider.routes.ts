import { Router } from "express";
import { 
  getProvider,
  updateProviderStatus, 
  updateWorkingArea, 
  searchProviders, 
  getTopRatedProvidersController 
} from "../controllers/provider.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * PROVIDER routes
 */

router.get("/top-rated", authMiddleware, getTopRatedProvidersController);
router.get("/search", authMiddleware, searchProviders);

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