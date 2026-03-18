import { Request, Response } from "express";
import * as providerService from "../services/provider.service";

export const updateProviderStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
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

export const updateWorkingArea = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
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
