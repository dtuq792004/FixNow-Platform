import express from "express";
import * as financeController from "../controllers/providerFinance.controller";

const router = express.Router();

router.get(
  "/providers/:providerId/revenue",
  financeController.getProviderRevenue
);

router.get(
  "/providers/:providerId/wallet",
  financeController.getProviderWallet
);

router.get(
  "/customers/:customerId/wallet",
  financeController.getCustomerWallet
);

export default router;