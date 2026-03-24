import { Router } from "express";
import {
  getProvider,
  updateProviderStatus,
  updateWorkingArea,
  searchProviders,
  getTopRatedProvidersController,
  getProviderPublicProfileController,
} from "../controllers/provider.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Named routes first — must precede /:id to avoid param capture
router.get("/top-rated", authMiddleware, getTopRatedProvidersController);
router.get("/search", authMiddleware, searchProviders);
router.get("/me", authMiddleware, getProvider);

router.patch("/status", authMiddleware, updateProviderStatus);
router.patch("/working-area", authMiddleware, updateWorkingArea);

// Public profile — last to avoid shadowing named routes above
router.get("/:id", authMiddleware, getProviderPublicProfileController);

export default router;
