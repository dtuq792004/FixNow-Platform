import { Response } from "express";
import * as providerService from "../services/provider.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const updateProviderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { activeStatus } = req.body;

    const provider = await providerService.updateProviderStatus(
      userId as string,
      activeStatus
    );

    return res.json({
      success: true,
      data: provider,
      message: "Provider status updated",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWorkingArea = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { workingAreas } = req.body;

    const provider = await providerService.updateWorkingArea(
      userId as string,
      workingAreas
    );

    return res.json({
      success: true,
      data: provider,
      message: "Working area updated",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
