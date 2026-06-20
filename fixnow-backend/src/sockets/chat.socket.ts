import { Server, Socket } from "socket.io";
import { MessageType } from "../models/message.model";
import { sendChatMessage } from "../services/chat.service";

type SendMessageAck = (response: {
  ok: boolean;
  message?: unknown;
  error?: string;
}) => void;

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const user = (socket as any).user;

  socket.on(
    "send_message",
    async (
      data: {
        conversationId: string;
        content: string;
        type?: MessageType;
      },
      ack?: SendMessageAck,
    ) => {
      try {
        const { message, recipientId } = await sendChatMessage({
          conversationId: data.conversationId,
          senderId: user.id,
          content: data.content,
          type: data.type,
        });

        io.to(user.id).emit("message_sent", message);
        if (recipientId) {
          io.to(recipientId).emit("chat:new_message", message);
        }

        ack?.({ ok: true, message });
      } catch (error) {
        console.error("Error sending message via socket:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        socket.emit("chat_error", { message: errorMessage });
        ack?.({ ok: false, error: errorMessage });
      }
    },
  );

  socket.on(
    "typing",
    (data: { conversationId: string; recipientId: string }) => {
      io.to(data.recipientId).emit("user_typing", {
        conversationId: data.conversationId,
        userId: user.id,
      });
    },
  );

  socket.on(
    "stop_typing",
    (data: { conversationId: string; recipientId: string }) => {
      io.to(data.recipientId).emit("user_stop_typing", {
        conversationId: data.conversationId,
        userId: user.id,
      });
    },
  );
};
