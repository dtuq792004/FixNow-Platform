import { Provider } from "../models/provider.model";
import User from "../models/user.model";
import FeedbackModel from "../models/feedback.model";

export const searchProvidersService = async (keyword: string) => {
  const searchRegex = new RegExp(keyword || "", "i");

  // Tìm các user có tên khớp với keyword
  const users = await User.find({
    fullName: searchRegex,
    role: "PROVIDER"
  }).select("_id");

  const userIds = users.map(u => u._id);

  // Dùng Aggregation trên Provider để lấy kèm Rating
  const providers = await Provider.aggregate([
    {
      $match: {
        $or: [
          { userId: { $in: userIds } },
          { description: searchRegex }
        ]
      }
    },
    // Lookup sang bảng User để lấy tên và avatar
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo"
      }
    },
    { $unwind: "$userInfo" },
    // Lookup sang bảng Feedback để tính Rating
    {
      $lookup: {
        from: "feedbacks",
        localField: "_id",
        foreignField: "providerId",
        as: "reviews"
      }
    },
    // Tính toán Average Rating và Review Count
    {
      $addFields: {
        allRatings: {
          $reduce: {
            input: "$reviews.servicesFeedbacks",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] }
          }
        }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "serviceCategories",
        foreignField: "_id",
        as: "categoriesDetails"
      }
    },
    {
      $project: {
        _id: 1,
        description: 1,
        experienceYears: 1,
        activeStatus: 1,
        verified: 1,
        workingAreas: 1,
        serviceCategories: "$categoriesDetails",
        userId: {
          _id: "$userInfo._id",
          fullName: "$userInfo.fullName",
          avatar: "$userInfo.avatar",
          phone: "$userInfo.phone"
        },
        avgRating: { $avg: "$allRatings.rating" },
        reviewCount: { $size: "$reviews" }
      }
    }
  ]);

  return providers;
};

export const updateProviderStatus = async (
  userId: string,
  activeStatus: "ONLINE" | "OFFLINE"
) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    { activeStatus },
    { new: true }
  );

  if (!provider) {
    throw new Error("Provider not found");
  }

  return provider;
};

export const updateWorkingArea = async (userId: string, workingAreas: string[]) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    { workingAreas },
    { new: true }
  );

  if (!provider) {
    throw new Error("Provider not found");
  }

  return provider;
};