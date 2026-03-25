import express from "express";
import * as financeController from "../controllers/providerFinance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * GET /finance/my-wallet
 * Returns the authenticated user's own wallet via JWT — no ID param needed.
 * Must be declared before /:providerId routes to avoid param matching.
 */
router.get(
  "/my-wallet",
  authMiddleware,
  financeController.getMyWallet
);

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