import express from "express";
import * as financeController from "../controllers/providerFinance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = express.Router();

/**
 * GET /finance/my-wallet
 * Returns the authenticated user's own wallet via JWT — no ID param needed.
 * Must be declared before /:providerId routes to avoid param matching.
 */
router.get(
  "/my-wallet",
  authMiddleware,
  roleMiddleware("PROVIDER"),
  financeController.getMyWallet
);
router.get("/my-revenue", authMiddleware, roleMiddleware("PROVIDER"), financeController.getMyRevenue);

router.get(
  "/providers/:providerId/revenue",
  authMiddleware,
  financeController.getProviderRevenue
);

router.get(
  "/providers/:providerId/wallet",
  authMiddleware,
  financeController.getProviderWallet
);

router.get(
  "/customers/:customerId/wallet",
  authMiddleware,
  financeController.getCustomerWallet
);

export default router;
