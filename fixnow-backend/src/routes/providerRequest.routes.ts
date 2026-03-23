import { Router } from "express";
import {
  createProviderRequest,
  getProviderRequests,
  approveProviderRequest,
  rejectProviderRequest
} from "../controllers/providerRequest.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * CUSTOMER submit request
 */

router.post(
  "/",
  authMiddleware,
  createProviderRequest
);

/**
 * ADMIN manage provider requests
 */

router.get(
  "/",
  // authMiddleware,
  getProviderRequests
);

router.patch(
  "/:id",
  // authMiddleware,
  approveProviderRequest
);

router.patch(
  "/:id/reject",
  // authMiddleware,
  rejectProviderRequest
);

export default router;