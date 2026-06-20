import { Router } from "express";
import {
  getProvider,
  updateProviderStatus,
  updateWorkingArea,
  searchProviders,
  getTopRatedProvidersController,
  getProviderPublicProfileController,
  updateProviderProfile,
} from "../controllers/provider.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

// Named routes first — must precede /:id to avoid param capture
router.get("/top-rated", authMiddleware, getTopRatedProvidersController);
router.get("/search", authMiddleware, searchProviders);
router.get("/me", authMiddleware, roleMiddleware("PROVIDER"), getProvider);

router.patch("/status", authMiddleware, roleMiddleware("PROVIDER"), updateProviderStatus);
router.patch("/working-area", authMiddleware, roleMiddleware("PROVIDER"), updateWorkingArea);
router.patch("/me", authMiddleware, roleMiddleware("PROVIDER"), updateProviderProfile);

// Public profile — last to avoid shadowing named routes above
router.get("/:id", authMiddleware, getProviderPublicProfileController);

export default router;
