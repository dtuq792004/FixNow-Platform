import mongoose from "mongoose";
import { PlatformSetting } from "../models/platformSetting.model";

/*
Get current settings
*/
export const getPlatformSettingService = async () => {

  let setting = await PlatformSetting.findOne();

  if (!setting) {

    setting = await PlatformSetting.create({
      platformFeePercent: 20,
      minWithdrawAmount: 100000
    });

  }

  return setting;
};


/*
Update settings (admin)
*/
export const updatePlatformSettingService = async (
  adminId: string,
  platformFeePercent: number,
  minWithdrawAmount: number
) => {

  if (platformFeePercent < 0 || platformFeePercent > 100) {
    throw new Error("Platform fee must be between 0 and 100");
  }

  let setting = await PlatformSetting.findOne();

  if (!setting) {

    setting = await PlatformSetting.create({
      platformFeePercent,
      minWithdrawAmount,
      updatedBy: adminId
    });

  } else {

    setting.platformFeePercent = platformFeePercent;
    setting.minWithdrawAmount = minWithdrawAmount;
    setting.updatedBy = new mongoose.Types.ObjectId(adminId);

    await setting.save();

  }

  return setting;
};