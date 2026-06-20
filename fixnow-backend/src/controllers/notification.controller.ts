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
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const notification = await notificationService.markAsRead(req.params.id as string, req.user.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

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

export const getAuthenticatedNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return res.json({ data: notifications });
  } catch {
    return res.status(500).json({ message: "Fetch notifications failed" });
  }
};

export const readAllAuthenticatedNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    await notificationService.markAllAsRead(req.user.id);
    return res.json({ message: "All notifications read" });
  } catch {
    return res.status(500).json({ message: "Update notifications failed" });
  }
};
