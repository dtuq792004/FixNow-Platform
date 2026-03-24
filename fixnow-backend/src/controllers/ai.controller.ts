import { Request, Response } from "express";
import * as aiService from "../services/ai.service";

export const chat = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      console.warn(`[AI Chat] req.body is undefined. Content-Type: ${req.headers["content-type"]}`);
      return res.status(400).json({ message: "Request body is empty or not JSON" });
    }
    const { message, history, imageBase64, mimeType } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({
        message: "Yêu cầu cung cấp nội dung text (message) hoặc hình ảnh (imageBase64)",
      });
    }

    const aiResponse = await aiService.chatWithGemini(
      message,
      history || [],
      imageBase64,
      mimeType
    );

    res.status(200).json({
      message: "Success",
      data: {
        reply: aiResponse,
      },
    });
  } catch (error: any) {
    console.error("[AI Chat Controller] Error:", error.message || error);
    res.status(500).json({
      message: "AI gặp lỗi trong quá trình phân tích.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
