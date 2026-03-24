import { Request, Response } from "express";
import mongoose from "mongoose";
import * as FeedbackService from "../services/feedback.services";
import { IRequestFeedback } from "../models/feedback.model";
import { Provider } from "../models/provider.model";

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user?.id);
    const { requestId, providerId, servicesFeedbacks } = req.body;

    if (!requestId || !providerId || !servicesFeedbacks) {
      return res.status(400).json({ message: "Thiếu dữ liệu cần thiết" });
    }

    // Resolve đúng Provider._id — client có thể truyền User._id hoặc Provider._id
    let resolvedProviderId: mongoose.Types.ObjectId;
    const providerById = await Provider.findById(providerId).select("_id").lean();
    if (providerById) {
      resolvedProviderId = providerById._id as mongoose.Types.ObjectId;
    } else {
      const providerByUserId = await Provider.findOne({ userId: providerId }).select("_id").lean();
      if (!providerByUserId) {
        return res.status(404).json({ message: "Không tìm thấy provider tương ứng" });
      }
      resolvedProviderId = providerByUserId._id as mongoose.Types.ObjectId;
    }

    const feedbackData: Partial<IRequestFeedback> = {
      requestId,
      customerId,
      providerId: resolvedProviderId,
      servicesFeedbacks,
    };

    const feedback = await FeedbackService.createFeedback(feedbackData);
    return res.status(201).json({ message: "Tạo feedback thành công", data: feedback });
  } catch (error: any) {
    console.error("Create feedback error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const replyFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackId = new mongoose.Types.ObjectId(req.params.id as string);
    const { providerReply } = req.body;

    if (!feedbackId) {
      return res.status(400).json({ message: "Thiếu feedback ID" });
    }
    if (!providerReply) {
      return res.status(400).json({ message: "Thiếu nội dung phản hồi" });
    }

    const updatedFeedback = await FeedbackService.updateFeedback(feedbackId, { providerReply });
    return res.status(200).json({ message: "Phản hồi feedback thành công", data: updatedFeedback });
  } catch (error: any) {
    console.error("Reply feedback error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
