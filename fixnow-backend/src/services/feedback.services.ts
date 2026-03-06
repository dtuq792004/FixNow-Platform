import { Types } from "mongoose";
import FeedbackModel from "../models/feedback.model";

export const getFeedbacks = async (page: number, limit: number, filter: any) => {
    try {
        const feedbacks = await FeedbackModel.paginate(
            filter,
            {page: page, limit: limit, sort: {createdAt: -1},
            populate: [{path: "requestId", select: "name description"},
            {path: "customerId", select: "fullName email phone"},
            {path: "providerId", select: "fullName email phone"}]
        }
        );
        return feedbacks;
    } catch (error: any) {
        console.error("Lỗi lấy feedbacks:", error);
        throw error;
    }
};

export const searchFeedbacks = async (keyword: string) => {
    const matchStage: any = {};
  
    if (keyword) {
      const words = keyword.trim().split(/\s+/);
  
      matchStage.$and = words.map((word) => ({
        "service.name": { $regex: word, $options: "i" }
      }));
    }
  
    const feedbacks = await FeedbackModel.aggregate([
      {
        $lookup: {
          from: "requests",
          localField: "requestId",
          foreignField: "_id",
          as: "request"
        }
      },
      { $unwind: "$request" },
  
      {
        $lookup: {
          from: "services",
          localField: "request.serviceId",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: "$service" },
  
      {
        $match: matchStage
      }
    ]);
  
    return feedbacks;
  };

  export const createFeedback = async (feedback: any) => {
    try {
        const newFeedback = await FeedbackModel.create(feedback);
        return newFeedback;
    } catch (error) {
        console.error("Lỗi không tạo được feedback:", error);
        throw error;
    }
};

export const updateFeedback = async (feedbackId : Types.ObjectId) => {
    
}