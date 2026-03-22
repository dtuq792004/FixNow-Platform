import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { registerChatHandlers } from "./chat.socket";
import { setIO } from "./notification.socket";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Gán cho notification
  setIO(io);

  // Middleware xác thực
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET) as any;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    
    // Tham gia phòng cá nhân
    if (user?.id) {
      socket.join(user.id);
    }

    // Đăng ký chat handlers
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      // console.log(`User ${user?.id} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
    if(!io) throw new Error("Socket not initialized");
    return io;
}
