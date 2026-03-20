import express from "express";

import {
  getDashboardSummaryController,
  getRevenueAnalyticsController,
  getOrderAnalyticsController,
  getTopProvidersController,
  getUserGrowthController,
  getWithdrawAnalyticsController
} from "../controllers/analytics.controller";

const router = express.Router();

router.get("/dashboard", getDashboardSummaryController);

router.get("/revenue", getRevenueAnalyticsController);

router.get("/orders", getOrderAnalyticsController);

router.get("/top-providers", getTopProvidersController);

router.get("/user-growth", getUserGrowthController);

router.get("/withdraws", getWithdrawAnalyticsController);

export default router;