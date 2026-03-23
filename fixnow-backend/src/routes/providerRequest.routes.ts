import { Router } from "express";
import {
  createProviderRequest,
  getMyProviderRequest,
  getProviderRequests,
  rejectProviderRequest,
  approveProviderRequest
} from "../controllers/providerRequest.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

/**
 * CUSTOMER submit request
 */

router.post(
  "/",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  createProviderRequest
);

/**
 * CUSTOMER get their request
 */

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  getMyProviderRequest
);

/**
 * ADMIN manage provider requests
 */

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getProviderRequests
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  approveProviderRequest
);

router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("ADMIN"),
  rejectProviderRequest
);

export default router;