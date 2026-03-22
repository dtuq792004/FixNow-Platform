import { Server, Socket } from "socket.io";

let io: Server;

export const setIO = (instance: Server) => {
  io = instance;
};

export const getIO = () => {
  return io;
};

export const registerNotificationHandlers = (socket: Socket) => {
  const user = (socket as any).user;

  socket.on("notification:join", () => {
    if (!user?.id) {
      socket.emit("notification:error", { message: "Unauthorized" });
      return;
    }

    socket.join(user.id);
    socket.emit("notification:joined", { room: user.id });
  });

  socket.on("notification:leave", () => {
    if (!user?.id) return;
    socket.leave(user.id);
    socket.emit("notification:left", { room: user.id });
  });
};

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
