import { Request, Response } from "express";
import { PlatformConfig } from "../models/platformConfig.model";

export class PlatformConfigController {

  static async getConfig(req: Request, res: Response) {
    const config = await PlatformConfig.findOne();
    res.json(config);
  }

  static async updateConfig(req: Request, res: Response) {
    const { platformFeePercent } = req.body;

    let config = await PlatformConfig.findOne();

    if (!config) {
      config = await PlatformConfig.create({ platformFeePercent });
    } else {
      config.platformFeePercent = platformFeePercent;
      await config.save();
    }

    res.json({ message: "Updated", config });
  }

}