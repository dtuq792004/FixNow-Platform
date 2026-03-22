import Conversation from "../models/conversation.model";
import Message, { MessageType } from "../models/message.model";
import mongoose from "mongoose";

export const getConversations = async (userId: string) => {
  return Conversation.find({
    participants: { $in: [new mongoose.Types.ObjectId(userId)] },
  })
    .populate("participants", "fullName avatar role")
    .populate({
      path: "lastMessage",
      select: "content type sender createdAt",
    })
    .sort({ updatedAt: -1 });
};

export const getMessages = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return {
      allowed: false,
      status: 404,
      message: "Conversation not found",
      messages: [],
    };
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId,
  );
  if (!isParticipant)
    return { allowed: false, status: 403, message: "Forbidden", messages: [] };
  const messages = await Message.find({ conversationId })
    .populate("sender", "fullName avatar")
    .sort({ createdAt: 1 });
  return { allowed: true, messages };
};

export const createConversation = async (
  userId: string,
  participantId: string,
) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, participantId] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, participantId],
    });
  }
  await conversation.populate("participants", "fullName avatar role");
  return conversation;
};

export interface SendChatMessageInput {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
}

export const sendChatMessage = async ({
  conversationId,
  senderId,
  content,
  type,
}: SendChatMessageInput) => {
  const message = await Message.create({
    conversationId,
    sender: senderId,
    content,
    type: type || MessageType.TEXT,
  });

  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { lastMessage: message._id, updatedAt: new Date() },
    { new: true },
  );

  await message.populate("sender", "fullName avatar role");

  let recipientId: string | null = null;
  if (conversation) {
    const recipient = conversation.participants.find(
      (participant) => participant.toString() !== senderId,
    );
    recipientId = recipient ? recipient.toString() : null;
  }

  return {
    message,
    recipientId,
  };
};
