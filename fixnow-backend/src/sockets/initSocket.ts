import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { registerChatHandlers } from "./chat.socket";
import { registerLocationHandlers } from "./location.socket";
import { registerNotificationHandlers, setIO } from "./notification.socket";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

let io: Server;

export const initSocket = (server: any) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8081",
    "http://localhost:19006",
    "https://fixnow-platform.vercel.app",
    "https://fix-now-platform.vercel.app",
  ];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        if (
          allowedOrigins.includes(origin) ||
          /^https:\/\/fix-?now-platform.*\.vercel\.app$/.test(origin)
        ) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Gán cho notification
  setIO(io);

  // Middleware xác thực
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      if (!ACCESS_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET not defined");
      }
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
    registerLocationHandlers(io, socket);
    registerNotificationHandlers(socket);
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
