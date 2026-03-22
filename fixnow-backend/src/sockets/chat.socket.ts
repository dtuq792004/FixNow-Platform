import { Server, Socket } from "socket.io";
import Message, { MessageType } from "../models/message.model";
import Conversation from "../models/conversation.model";

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const user = (socket as any).user;

  socket.on("send_message", async (data: { conversationId: string; content: string; type?: MessageType }) => {
    try {
      const { conversationId, content, type } = data;
      const senderId = user.id;
      console.log(`Socket: user ${senderId} sending message to conv ${conversationId}`);

      // Lưu tin nhắn vào DB
      const message = await Message.create({
        conversationId,
        sender: senderId,
        content,
        type: type || MessageType.TEXT
      });

      // Cập nhật conversation
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: message._id, updatedAt: new Date() },
        { new: true }
      );

      await message.populate("sender", "fullName avatar role");

      // Gửi cho chính người gửi (để đồng bộ)
      socket.emit("message_sent", message);

      // Gửi cho người nhận
      if (conversation) {
        const recipientId = conversation.participants.find(
          (p) => p.toString() !== senderId
        );
        console.log(`Socket: found recipient ${recipientId} in participants ${conversation.participants}`);
        if (recipientId) {
          io.to(recipientId.toString()).emit("new_message", message);
          console.log(`Message from ${senderId} sent to ${recipientId}`);
        }
      }
    } catch (error) {
      console.error("Error sending message via socket:", error);
      socket.emit("chat_error", { message: "Failed to send message" });
    }
  });

  // Xử lý báo "đang soạn tin" (typing)
  socket.on("typing", (data: { conversationId: string; recipientId: string }) => {
    io.to(data.recipientId).emit("user_typing", {
      conversationId: data.conversationId,
      userId: user.id
    });
  });

  socket.on("stop_typing", (data: { conversationId: string; recipientId: string }) => {
    io.to(data.recipientId).emit("user_stop_typing", {
      conversationId: data.conversationId,
      userId: user.id
    });
  });
};
