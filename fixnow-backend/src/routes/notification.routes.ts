import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.post("/", notificationController.createNotification);

router.get("/:userId", notificationController.getMyNotifications);

router.patch("/:id/read", notificationController.readNotification);

router.patch("/read-all/:userId", notificationController.readAllNotifications);

export default router;