import { Request, Response } from "express";
import User, {IUser } from "../models/user.model";
import * as FeedbackService from "../services/feedback.services";
import { IRequestFeedback } from "../models/feedback.model";
import { Provider } from "../models/provider.model";
import mongoose from "mongoose";

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, filter } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    let parsedFilter: any = {};

    if (filter) {
      try {
        parsedFilter = JSON.parse(filter as string);
      } catch {
        parsedFilter = {};
      }
    }

    const feedbacks = await FeedbackService.getFeedbacks(
      pageNumber,
      limitNumber,
      parsedFilter
    );

    if(!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({
        message: "Không tìm thấy feedback nào",
      });
    }

    return res.status(200).json({
      message: "Lấy danh sách feedback thành công",
      data: feedbacks,
    });
  } catch (error: any) {
    console.error("Lỗi không lấy được dữ liệu:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const getFeedbackByProviderId = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const currentUserId = req.user?.id;
    const providerId = req.params.id;

    if (!providerId) {
        return res.status(400).json({
          message: "Missing provider ID",
        });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter: any = {
      providerId: providerId,
    };

    if(currentUserId !== providerId) {
      filter.status = "VISIBLE";
    }

    const feedbacks = await FeedbackService.getFeedbacks(
      pageNumber,
      limitNumber,
      filter
    );

    if(!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({
        message: "Không tìm thấy feedback nào",
      });
    }

    return res.status(200).json({
      message: "Lấy feedback theo provider thành công",
      data: feedbacks,
    });
  } catch (error: any) {
    console.error("Get feedback by provider id error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const getFeedbackByCustomerId = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter = {
      customerId: customerId
    };

    const feedbacks = await FeedbackService.getFeedbacks(
      pageNumber,
      limitNumber,
      filter
    );

    if(!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({
        message: "Không tìm thấy feedback nào",
      });
    }

    return res.status(200).json({
      message: "Lấy feedback theo customer thành công",
      data: feedbacks,
    });
  } catch (error: any) {
    console.error("Get feedback by customer id error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const getFeedbackByRequestId = async(req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const requestId = req.params.requestId;

    if (!requestId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter = {
      requestId: requestId
    };

    const feedbacks = await FeedbackService.getFeedbacks(
      pageNumber,
      limitNumber,
      filter
    );

    if(!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({
        message: "Không tìm thấy feedback nào",
      });
    }

    return res.status(200).json({
      message: "Lấy feedback theo customer thành công",
      data: feedbacks,
    });
  } catch (error: any) {
    console.error("Get feedback by request id error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user?.id);
    const { requestId, providerId, servicesFeedbacks } = req.body;

    if (!requestId || !providerId || !servicesFeedbacks) {
      return res.status(400).json({
        message: "Thiếu dữ liệu cần thiết",
      });
    }

    // Resolve đúng Provider._id:
    // Client có thể truyền User._id hoặc Provider._id, cần đảm bảo lưu Provider._id
    let resolvedProviderId: mongoose.Types.ObjectId;
    const providerById = await Provider.findById(providerId).select("_id").lean();
    if (providerById) {
      // providerId đã là Provider._id hợp lệ
      resolvedProviderId = providerById._id as mongoose.Types.ObjectId;
    } else {
      // Thử tìm Provider theo userId (trường hợp client truyền User._id)
      const providerByUserId = await Provider.findOne({ userId: providerId }).select("_id").lean();
      if (!providerByUserId) {
        return res.status(404).json({
          message: "Không tìm thấy provider tương ứng",
        });
      }
      resolvedProviderId = providerByUserId._id as mongoose.Types.ObjectId;
    }

    const feedbackData: Partial<IRequestFeedback> = {
      requestId,
      customerId,
      providerId: resolvedProviderId,
      servicesFeedbacks
    };

    const feedback = await FeedbackService.createFeedback(feedbackData);

    return res.status(201).json({
      message: "Tạo feedback thành công",
      data: feedback,
    });

  } catch (error: any) {
    console.error("Create feedback error:", error);

    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const replyFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackId = new mongoose.Types.ObjectId(req.params.id as string);
    const { providerReply } = req.body;

    if (!feedbackId) {
      return res.status(400).json({
        message: "Thiếu feedback ID",
      });
    }

    if (!providerReply) {
      return res.status(400).json({
        message: "Thiếu nội dung phản hồi",
      });
    }

    const updatedFeedback = await FeedbackService.updateFeedback(
      feedbackId,
      { providerReply }
    );

    return res.status(200).json({
      message: "Phản hồi feedback thành công",
      data: updatedFeedback,
    });

  } catch (error: any) {
    console.error("Reply feedback error:", error);

    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

export const searchFeedbacks = async (req: Request, res: Response) => {
  try {
    const { keyword = "" } = req.query;

    const feedbacks = await FeedbackService.searchFeedbacks(
      keyword as string
    );

    return res.status(200).json({
      message: "Tìm kiếm feedback thành công",
      data: feedbacks,
    });
  } catch (error: any) {
    console.error("Search feedback error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};