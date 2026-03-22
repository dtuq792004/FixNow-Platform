import { Server, Socket } from "socket.io";
import {
  canJoinRequestLocationRoom,
  getProviderLocation,
  markProviderOffline,
  updateProviderLocation,
} from "../services/location.service";

interface JoinRequestLocationPayload {
  requestId: string;
}

interface UpdateLocationPayload {
  requestId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

const getRequestLocationRoom = (requestId: string) =>
  `request_location:${requestId}`;

export const registerLocationHandlers = (io: Server, socket: Socket) => {
  const user = (socket as any).user;

  socket.on(
    "location:join_request",
    async (payload: JoinRequestLocationPayload) => {
      try {
        if (!payload?.requestId) {
          socket.emit("location:error", { message: "requestId is required" });
          return;
        }

        const result = await canJoinRequestLocationRoom(
          payload.requestId,
          user.id,
        );
        if (!result.allowed || !result.request) {
          socket.emit("location:error", { message: result.reason });
          return;
        }

        const room = getRequestLocationRoom(payload.requestId);
        socket.join(room);

        if (result.request.providerId) {
          const latestLocation = await getProviderLocation(
            result.request.providerId.toString(),
          );
          if (latestLocation) {
            socket.emit("location:provider_snapshot", {
              requestId: payload.requestId,
              providerId: result.request.providerId.toString(),
              location: latestLocation,
            });
          }
        }

        socket.emit("location:joined_request", {
          requestId: payload.requestId,
        });
      } catch (error) {
        socket.emit("location:error", {
          message: "Failed to join location room",
        });
      }
    },
  );

  socket.on("location:leave_request", (payload: JoinRequestLocationPayload) => {
    if (!payload?.requestId) {
      socket.emit("location:error", { message: "requestId is required" });
      return;
    }

    socket.leave(getRequestLocationRoom(payload.requestId));
    socket.emit("location:left_request", { requestId: payload.requestId });
  });

  socket.on("location:update", async (payload: UpdateLocationPayload) => {
    try {
      const { requestId, lat, lng, accuracy, heading, speed } =
        payload || ({} as UpdateLocationPayload);

      if (!requestId || typeof lat !== "number" || typeof lng !== "number") {
        socket.emit("location:error", {
          message: "requestId, lat, lng are required",
        });
        return;
      }

      const membership = await canJoinRequestLocationRoom(requestId, user.id);
      if (!membership.allowed || !membership.request) {
        socket.emit("location:error", { message: "Forbidden" });
        return;
      }

      if (membership.request.providerId?.toString() !== user.id) {
        socket.emit("location:error", {
          message: "Only assigned provider can update location",
        });
        return;
      }

      const location = await updateProviderLocation({
        providerId: user.id,
        lat,
        lng,
        accuracy,
        heading,
        speed,
      });

      const room = getRequestLocationRoom(requestId);
      io.to(room).emit("location:provider_updated", {
        requestId,
        providerId: user.id,
        location,
      });

      socket.emit("location:updated", {
        requestId,
        location,
      });
    } catch (error) {
      socket.emit("location:error", { message: "Failed to update location" });
    }
  });

  socket.on("disconnect", async () => {
    if (user?.role === "PROVIDER" && user?.id) {
      await markProviderOffline(user.id);
    }
  });
};
