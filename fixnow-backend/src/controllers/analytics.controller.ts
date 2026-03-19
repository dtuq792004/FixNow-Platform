import { Request, Response } from "express";

import {
  getDashboardSummaryService,
  getRevenueAnalyticsService,
  getOrderAnalyticsService,
  getTopProvidersService,
  getUserGrowthService,
  getWithdrawAnalyticsService
} from "../services/analytics.service";

export const getDashboardSummaryController = async (req: Request, res: Response) => {
  try {

    const data = await getDashboardSummaryService();

    res.json({
      message: "Dashboard analytics",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    });
  }
};

export const getRevenueAnalyticsController = async (req: Request, res: Response) => {
  try {

    const range = (req.query.range as string) || "month";

    const data = await getRevenueAnalyticsService(range);

    res.json({
      message: "Revenue analytics",
      range,
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    });
  }
};

export const getOrderAnalyticsController = async (req: Request, res: Response) => {
  try {

    const data = await getOrderAnalyticsService();

    res.json({
      message: "Order analytics",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    });
  }
};

export const getTopProvidersController = async (req: Request, res: Response) => {
  try {

    const data = await getTopProvidersService();

    res.json({
      message: "Top providers",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    });
  }
};

export const getUserGrowthController = async (req: Request, res: Response) => {
  try {

    const data = await getUserGrowthService();

    res.json({
      message: "User growth analytics",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    });
  }
};

export const getWithdrawAnalyticsController = async (req: Request, res: Response) => {
  try {

    const data = await getWithdrawAnalyticsService();

    res.json({
      message: "Withdraw analytics",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    });
  }
};