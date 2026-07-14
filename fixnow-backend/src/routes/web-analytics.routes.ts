import { Router } from "express";
import { collectController } from "../controllers/web-analytics.controller";

const router = Router();

// Public — tracker ở web gọi (beacon), không cần đăng nhập.
router.post("/collect", collectController);

export default router;
