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

/**
 * Tính điểm rating trung bình cho 1 provider cụ thể
 */
export const getProviderAverageRating = async (providerId: string | mongoose.Types.ObjectId) => {
  const stats = await FeedbackModel.aggregate([
    { $match: { providerId: new mongoose.Types.ObjectId(providerId), status: "VISIBLE" } },
    { $unwind: "$servicesFeedbacks" },
    {
      $group: {
        _id: "$providerId",
        avgRating: { $avg: "$servicesFeedbacks.rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  return stats[0] || { avgRating: 0, reviewCount: 0 };
};

/**
 * Lấy Top n thợ có đánh giá cao nhất
 */
export const getTopRatedProviders = async (limit: number = 4) => {
  const topProviders = await FeedbackModel.aggregate([
    { $match: { status: "VISIBLE" } },
    { $unwind: "$servicesFeedbacks" },
    {
      $group: {
        _id: "$providerId",
        avgRating: { $avg: "$servicesFeedbacks.rating" },
        // Sử dụng $addToSet nếu muốn đếm số lượng feedback duy nhất thay vì đếm từng dòng rating
        feedbackIds: { $addToSet: "$_id" }
      }
    },
    {
      $project: {
        _id: 1,
        avgRating: 1,
        reviewCount: { $size: "$feedbackIds" }
      }
    },
    { $sort: { avgRating: -1, reviewCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "providers",
        localField: "_id",
        foreignField: "_id",
        as: "providerInfo"
      }
    },
    { $unwind: { path: "$providerInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "providerInfo.userId",
        foreignField: "_id",
        as: "userInfo"
      }
    },
    { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "providerInfo.serviceCategories",
        foreignField: "_id",
        as: "categories"
      }
    },
    {
      $project: {
        _id: "$_id",
        avgRating: 1,
        reviewCount: 1,
        experienceYears: { $ifNull: ["$providerInfo.experienceYears", 0] },
        description: { $ifNull: ["$providerInfo.description", ""] },
        workingAreas: { $ifNull: ["$providerInfo.workingAreas", []] },
        userId: {
          fullName: { $ifNull: ["$userInfo.fullName", "Thợ chưa cập nhật"] },
          avatar: "$userInfo.avatar",
          phone: "$userInfo.phone"
        },
        serviceCategories: "$categories"
      }
    }
  ]);

  return topProviders;
};