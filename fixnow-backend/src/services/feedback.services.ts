import mongoose from "mongoose";
import FeedbackModel, { IRequestFeedback } from "../models/feedback.model";

export const getFeedbacks = async (page: number, limit: number, filter: any) => {
    try {
        const feedbacks = await FeedbackModel.paginate(
            filter,
            {page: page, limit: limit, sort: {createdAt: -1},
            populate: [
            { path: "requestId",
              select: "name description"},
            { path: "customerId",
              select: "fullName email phone role avatar socialLogin",
            populate: {
              path: "socialLogin",
              select: "socialId provider"
            }},
            { path: "providerId",
              select: "fullName email phone role avatar socialLogin experienceYears activeStatus verified serviceCatagories workingAreas",
            populate: {
              path: "socialLogin",
              select: "socialId provider"
            }}
            ]
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

export const createFeedback = async (data: Partial<IRequestFeedback>) => {
    try {
        return await FeedbackModel.create(data);
    } catch (error) {
        console.error("Lỗi không tạo được feedback:", error);
        throw error;
    }
};

export const updateFeedback = async (
  feedbackId: mongoose.Types.ObjectId,
  data: Partial<IRequestFeedback>
) => {
    try {
        const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
            feedbackId,
            { $set: data },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedFeedback) {
            throw new Error("Feedback không tồn tại");
        }

        return updatedFeedback;
    } catch (error) {
        console.error("Lỗi không cập nhật được feedback:", error);
        throw error;
    }
};