import { Request, Response } from "express";
import * as revenueService from "../services/revenue.service";
import * as walletService from "../services/wallet.service";

export const getProviderRevenue = async (req: Request, res: Response) => {
  try {
    const providerId = req.params.providerId as string;
    const range = req.query.range as "day" | "month" | "year";

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
    const providerId = req.params.providerId as string;

    const wallet = await walletService.getWalletByProvider(providerId);

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