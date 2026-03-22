import { Server, Socket } from "socket.io";
import { MessageType } from "../models/message.model";
import { sendChatMessage } from "../services/chat.service";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const user = (socket as any).user;

  socket.on(
    "send_message",
    async (data: {
      conversationId: string;
      content: string;
      type?: MessageType;
    }) => {
      try {
        const { conversationId, content, type } = data;
        const senderId = user.id;
        const { message, recipientId } = await sendChatMessage({
          conversationId,
          senderId,
          content,
          type,
        });

        // Gửi cho chính người gửi (để đồng bộ)
        socket.emit("message_sent", message);

        // Gửi cho người nhận
        if (recipientId) {
          io.to(recipientId).emit("new_message", message);
        }
      } catch (error) {
        console.error("Error sending message via socket:", error);
        socket.emit("chat_error", { message: "Failed to send message" });
      }
    },
  );

  // Xử lý báo "đang soạn tin" (typing)
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
