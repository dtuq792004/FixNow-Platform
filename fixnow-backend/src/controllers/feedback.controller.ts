import { Request, Response } from "express";
import { User, UserDocument } from "../models/user.model";
import * as FeedbackService from "../services/feedback.services";
import FeedbackModel from "../models/feedback.model";
import { Types } from "mongoose";

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

    const providerId = req.user?.id;

    if (!providerId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter = {
      providerId: providerId,
    };

    const feedbacks = await FeedbackService.getFeedbacks(
      pageNumber,
      limitNumber,
      filter
    );

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

export const createFeedback = async (req: Request, res: Response) => {
  try { }
  catch (error: any) {
    console.error("Create feedback error:", error);
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

export const replyFeedback = async(req: Request, res: Response) => {
  
};