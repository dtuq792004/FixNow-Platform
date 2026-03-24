import { Request, Response } from "express";
import * as FeedbackService from "../services/feedback.services";

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, filter } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    let parsedFilter: any = {};
    if (filter) {
      try { parsedFilter = JSON.parse(filter as string); } catch { parsedFilter = {}; }
    }

    const feedbacks = await FeedbackService.getFeedbacks(pageNumber, limitNumber, parsedFilter);

    if (!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({ message: "Không tìm thấy feedback nào" });
    }
    return res.status(200).json({ message: "Lấy danh sách feedback thành công", data: feedbacks });
  } catch (error: any) {
    console.error("Lỗi không lấy được dữ liệu:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const getFeedbackByProviderId = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const currentUserId = req.user?.id;
    const providerId = req.params.id;

    if (!providerId) {
      return res.status(400).json({ message: "Missing provider ID" });
    }

    const filter: any = { providerId };
    if (currentUserId !== providerId) filter.status = "VISIBLE";

    const feedbacks = await FeedbackService.getFeedbacks(
      Number(page), Number(limit), filter,
    );

    if (!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({ message: "Không tìm thấy feedback nào" });
    }
    return res.status(200).json({ message: "Lấy feedback theo provider thành công", data: feedbacks });
  } catch (error: any) {
    console.error("Get feedback by provider id error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const getFeedbackByCustomerId = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const feedbacks = await FeedbackService.getFeedbacks(
      Number(page), Number(limit), { customerId },
    );

    if (!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({ message: "Không tìm thấy feedback nào" });
    }
    return res.status(200).json({ message: "Lấy feedback theo customer thành công", data: feedbacks });
  } catch (error: any) {
    console.error("Get feedback by customer id error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const getFeedbackByRequestId = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const requestId = req.params.id; // route: /request/:id

    if (!requestId) {
      return res.status(400).json({ message: "Missing request ID" });
    }

    const feedbacks = await FeedbackService.getFeedbacks(
      Number(page), Number(limit), { requestId },
    );

    if (!feedbacks || feedbacks.docs.length === 0) {
      return res.status(200).json({ message: "Không tìm thấy feedback nào" });
    }
    return res.status(200).json({ message: "Lấy feedback theo request thành công", data: feedbacks });
  } catch (error: any) {
    console.error("Get feedback by request id error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const searchFeedbacks = async (req: Request, res: Response) => {
  try {
    const { keyword = "" } = req.query;
    const feedbacks = await FeedbackService.searchFeedbacks(keyword as string);
    return res.status(200).json({ message: "Tìm kiếm feedback thành công", data: feedbacks });
  } catch (error: any) {
    console.error("Search feedback error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
