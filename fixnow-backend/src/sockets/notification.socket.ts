import { Server } from "socket.io";

let io: Server;

export const setIO = (instance: Server) => {
  io = instance;
};

export const getIO = () => {
    return io;
}

export const sendNotificationRealtime = (userId: string, notification: any) => {
  if (!io) {
    console.warn("Socket.io not initialized, cannot send notification");
    return;
  }
  io.to(userId).emit("notification", notification);
};

export const sendMessageRealtime = (userId: string, data: any) => {
  if (!io) return;
  io.to(userId).emit("new_message", data);
};