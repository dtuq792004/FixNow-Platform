import { Router } from "express";
import { 
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

router.get("/top-rated", getTopRatedProvidersController);
router.get("/search", searchProviders);

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