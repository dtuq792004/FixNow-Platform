import { Request, Response } from "express";
import * as revenueService from "../services/revenue.service";
import * as walletService from "../services/wallet.service";

export const getProviderRevenue = async (req: Request, res: Response) => {
  try {
    const requestingUserId = req.user?.id;
    const providerId = req.params.providerId as string;
    const range = req.query.range as "day" | "month" | "year";

    // Only the provider themselves or an admin can view revenue
    if (requestingUserId !== providerId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const revenue = await revenueService.getRevenueByProvider(
      providerId,
      range
    );

    res.json({
      success: true,
      data: revenue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProviderWallet = async (req: Request, res: Response) => {
  try {
    const requestingUserId = req.user?.id;
    const providerId = req.params.providerId as string;

    // Only the provider themselves or an admin can view their wallet
    if (requestingUserId !== providerId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const wallet = await walletService.getWalletByUser(providerId);

    res.json({
      success: true,
      data: wallet
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCustomerWallet = async (req: Request, res: Response) => {
  try {
    const requestingUserId = req.user?.id;
    const customerId = req.params.customerId as string;

    // Only the customer themselves or an admin can view their wallet
    if (requestingUserId !== customerId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const wallet = await walletService.getWalletByUser(customerId);

    res.json({
      success: true,
      data: wallet
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /finance/my-wallet
 * Returns the wallet of the currently authenticated user.
 * Uses JWT (req.user.id) — no URL param needed, avoids user._id issues on frontend.
 */
export const getMyWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const wallet = await walletService.getWalletByUser(userId);

    res.json({
      success: true,
      data: wallet
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};