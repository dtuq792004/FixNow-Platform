import { Server, Socket } from "socket.io";
import { Provider } from "../models/provider.model";
import Request from "../models/request.model";

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

export const sendRequestUpdatedRealtime = (
  userId: string,
  payload: { requestId: string; status: string; providerId?: string },
) => {
  if (!io) return;
  io.to(userId).emit("request:updated", payload);
};

export const sendNewRequestToMatchingProviders = async (requestId: string) => {
  try {
    if (!io) return;

    const request = await Request.findById(requestId)
      .populate("customerId", "fullName avatar")
      .populate("categoryId", "name type")
      .populate("addressId")
      .lean();

    if (!request || request.status !== "PENDING" || !request.categoryId) return;

    const categoryId =
      typeof request.categoryId === "object" && "_id" in request.categoryId
        ? request.categoryId._id
        : request.categoryId;
    const providers = await Provider.find({
      verified: true,
      serviceCategories: categoryId,
    })
      .select("userId")
      .lean();

    const payload = {
      request,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    };

    for (const provider of providers) {
      io.to(provider.userId.toString()).emit("provider:new_request", payload);
    }
  } catch (error) {
    console.error("Failed to emit new provider request:", error);
  }
};
