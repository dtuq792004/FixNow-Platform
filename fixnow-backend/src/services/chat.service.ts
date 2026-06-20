import Conversation from "../models/conversation.model";
import Message, { MessageType } from "../models/message.model";
import mongoose, { ClientSession } from "mongoose";

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

export const ensureConversation = async (
  userId: string,
  participantId: string,
  session?: ClientSession,
) => {
  const query = Conversation.findOne({
    participants: {
      $all: [
        new mongoose.Types.ObjectId(userId),
        new mongoose.Types.ObjectId(participantId),
      ],
      $size: 2,
    },
  });
  if (session) query.session(session);

  let conversation = await query;
  if (!conversation) {
    conversation = new Conversation({
      participants: [userId, participantId],
    });
    await conversation.save({ session });
  }
  return conversation;
};

export const createConversation = async (
  userId: string,
  participantId: string,
) => {
  const conversation = await ensureConversation(userId, participantId);
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
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new Error("Conversation not found");
  }

  const normalizedContent = content?.trim();
  if (!normalizedContent) {
    throw new Error("Message content is required");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: new mongoose.Types.ObjectId(senderId),
  });

  if (!conversation) {
    throw new Error("Forbidden");
  }

  const message = await Message.create({
    conversationId,
    sender: senderId,
    content: normalizedContent,
    type: type || MessageType.TEXT,
  });

  await Conversation.findByIdAndUpdate(
    conversation._id,
    { lastMessage: message._id, updatedAt: new Date() },
  );

  await message.populate("sender", "fullName avatar role");

  const recipient = conversation.participants.find(
    (participant) => participant.toString() !== senderId,
  );
  const recipientId = recipient ? recipient.toString() : null;

  return {
    message,
    recipientId,
  };
};
