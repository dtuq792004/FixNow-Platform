import { Request, Response } from "express";
import {
  getPlatformSettingService,
  updatePlatformSettingService
} from "../services/platformSetting.service";


export const getPlatformSettingController = async (
  req: Request,
  res: Response
) => {
  try {

    const setting = await getPlatformSettingService();

    res.json({
      message: "Platform settings fetched",
      data: setting
    });

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    });

  }
};


export const updatePlatformSettingController = async (
  req: Request,
  res: Response
) => {

  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }
    
    const adminId = req.user.id;

    const { platformFeePercent, minWithdrawAmount } = req.body;

    const setting = await updatePlatformSettingService(
      adminId,
      platformFeePercent,
      minWithdrawAmount
    );

    res.json({
      message: "Platform settings updated",
      data: setting
    });

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    });

  }
};