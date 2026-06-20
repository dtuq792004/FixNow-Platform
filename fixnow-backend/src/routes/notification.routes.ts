import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, notificationController.getAuthenticatedNotifications);
router.patch("/me/read-all", authMiddleware, notificationController.readAllAuthenticatedNotifications);
router.patch("/:id/read", authMiddleware, notificationController.readNotification);

router.get("/:userId", authMiddleware, notificationController.getMyNotifications);
router.patch("/read-all/:userId", authMiddleware, notificationController.readAllNotifications);

export default router;
