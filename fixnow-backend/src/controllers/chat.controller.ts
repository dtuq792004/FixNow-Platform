import { Request, Response } from "express";
import * as chatService from "../services/chat.service";

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const conversations = await chatService.getConversations(userId);
    return res.status(200).json(conversations);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params as any;
    if (!conversationId)
      return res.status(400).json({ message: "conversationId is required" });
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = await chatService.getMessages(conversationId, userId);
    if (!result.allowed) {
      const statusCode = result.status as number;
      return res.status(statusCode).json({ message: result.message });
    }
    return res.status(200).json(result.messages);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { participantId } = req.body as any;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (userId === participantId)
      return res.status(400).json({ message: "Cannot chat with yourself" });
    const conversation = await chatService.createConversation(
      userId,
      participantId,
    );
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
    const { message, recipientId } = await chatService.sendChatMessage({
      conversationId,
      senderId: userId,
      content,
      type,
    });
    // (Có thể emit realtime ở đây nếu cần)
    return res.status(201).json({ message, recipientId });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadChatImage = async (req: Request, res: Response) => {
  try {
    const imageUrl = (req as any).imageUrl;
    if (!imageUrl)
      return res.status(400).json({ message: "Image upload failed" });

    return res.status(200).json({ imageUrl });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
