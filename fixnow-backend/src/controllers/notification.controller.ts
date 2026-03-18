import { Request, Response } from "express";
import * as notificationService from "../services/notification.services";

export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.createNotification(req.body);

    res.status(201).json({
      message: "Notification created",
      data: notification
    });
  } catch {
    res.status(500).json({
      message: "Create notification failed"
    });
  }
};

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getUserNotifications(
      req.params.userId as string
    );

    res.json(notifications);
  } catch {
    res.status(500).json({
      message: "Fetch notifications failed"
    });
  }
};

export const readNotification = async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id as string);

    res.json(notification);
  } catch {
    res.status(500).json({
      message: "Update notification failed"
    });
  }
};

export const readAllNotifications = async (req: Request, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.params.userId as string);

    res.json({
      message: "All notifications read"
    });
  } catch {
    res.status(500).json({
      message: "Update notifications failed"
    });
  }
};