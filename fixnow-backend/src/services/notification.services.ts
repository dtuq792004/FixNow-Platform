import { Notification } from "../models/notification.model";
import { sendNotificationRealtime } from "../sockets/notification.socket";

export const createNotification = async (data: any) => {
  const notification = await Notification.create(data);

  sendNotificationRealtime(
    notification.recipientId.toString(),
    notification
  );

  return notification;
};

export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ recipientId: userId })
    .sort({ createdAt: -1 });
};

export const markAsRead = async (id: string) => {
  return await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId: string) => {
  return await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true }
  );
};