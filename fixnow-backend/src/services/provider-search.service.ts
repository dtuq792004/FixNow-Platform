import { Provider } from "../models/provider.model";
import User from "../models/user.model";

/** Full-text search for providers by name or description, with rating stats. */
export const searchProvidersService = async (keyword: string) => {
  const searchRegex = new RegExp(keyword || "", "i");

  const users = await User.find({
    fullName: searchRegex,
    role: "PROVIDER",
  }).select("_id");

  const userIds = users.map((u) => u._id);

  const providers = await Provider.aggregate([
    {
      $match: {
        $or: [
          { userId: { $in: userIds } },
          { description: searchRegex },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $lookup: {
        from: "feedbacks",
        localField: "_id",
        foreignField: "providerId",
        as: "reviews",
      },
    },
    {
      $addFields: {
        allRatings: {
          $reduce: {
            input: "$reviews.servicesFeedbacks",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "serviceCategories",
        foreignField: "_id",
        as: "categoriesDetails",
      },
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
          phone: "$userInfo.phone",
        },
        avgRating: { $avg: "$allRatings.rating" },
        reviewCount: { $size: "$reviews" },
      },
    },
  ]);

  return providers;
};
