import express from "express";

import {
  getDashboardSummaryController,
  getRevenueAnalyticsController,
  getOrderAnalyticsController,
  getTopProvidersController,
  getUserGrowthController,
  getWithdrawAnalyticsController
} from "../controllers/analytics.controller";
import {
  getWebOverviewController,
  getWebBreakdownController,
  getWebRealtimeController,
} from "../controllers/web-analytics.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = express.Router();

// All /admin/analytics/* endpoints require an admin JWT (financial + web traffic data).
router.use(authMiddleware, roleMiddleware("ADMIN"));

// Web analytics (Vercel-style) — /admin/analytics/web/*
router.get("/web/overview", getWebOverviewController);
router.get("/web/breakdown", getWebBreakdownController);
router.get("/web/realtime", getWebRealtimeController);

router.get("/dashboard", getDashboardSummaryController);

router.get("/revenue", getRevenueAnalyticsController);

router.get("/orders", getOrderAnalyticsController);

router.get("/top-providers", getTopProvidersController);

router.get("/user-growth", getUserGrowthController);

router.get("/withdraws", getWithdrawAnalyticsController);

export default router;