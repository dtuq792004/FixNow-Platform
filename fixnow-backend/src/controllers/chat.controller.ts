import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import Message, { MessageType } from "../models/message.model";
import mongoose from "mongoose";
import { sendMessageRealtime } from "../sockets/notification.socket";

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const conversations = await Conversation.find({
      participants: { $in: [new mongoose.Types.ObjectId(userId)] },
    })
      .populate("participants", "fullName avatar role")
      .populate({
        path: "lastMessage",
        select: "content type sender createdAt",
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Check if user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) return res.status(403).json({ message: "Forbidden" });

    const messages = await Message.find({ conversationId })
      .populate("sender", "fullName avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { participantId } = req.body; // The other person (provider or customer)
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (userId === participantId) return res.status(400).json({ message: "Cannot chat with yourself" });

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId],
      });
    }

    await conversation.populate("participants", "fullName avatar role");

    return res.status(201).json(conversation);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, content, type } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const message = await Message.create({
      conversationId,
      sender: userId,
      content,
      type: type || MessageType.TEXT,
    });

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: message._id },
      { new: true }
    );

    await message.populate("sender", "fullName avatar");

    // Real-time broadcast to recipient
    if (conversation) {
      const recipientId = conversation.participants.find(
        (p) => p.toString() !== userId
      );
      if (recipientId) {
        sendMessageRealtime(recipientId.toString(), message);
      }
    }

    return res.status(201).json(message);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadChatImage = async (req: Request, res: Response) => {
  try {
    const imageUrl = (req as any).imageUrl;
    if (!imageUrl) return res.status(400).json({ message: "Image upload failed" });

    return res.status(200).json({ imageUrl });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
