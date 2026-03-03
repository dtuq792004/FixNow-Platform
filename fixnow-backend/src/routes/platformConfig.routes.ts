import { Router } from "express";
import { PlatformConfigController } from "../controllers/platformConfig.controller";

const router = Router();

router.get("/", PlatformConfigController.getConfig);
router.put("/", PlatformConfigController.updateConfig);

export default router;