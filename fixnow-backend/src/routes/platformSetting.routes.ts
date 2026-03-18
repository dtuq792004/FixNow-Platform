import express from "express";
import {
  getPlatformSettingController,
  updatePlatformSettingController,
} from "../controllers/platformSetting.controller";

const router = express.Router();

router.get("/admin/platform-settings", getPlatformSettingController);

router.patch("/admin/platform-settings", updatePlatformSettingController);

export default router;
