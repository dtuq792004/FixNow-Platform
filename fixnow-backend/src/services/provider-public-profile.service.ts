import { Provider } from "../models/provider.model";
import FeedbackModel from "../models/feedback.model";
import { Types } from "mongoose";

/**
 * Fetch a public provider profile by either Provider._id or User._id.
 * Returns profile data + rating stats + 5 most-recent visible reviews.
 */
export const getProviderPublicProfile = async (id: string) => {
  let objectId: Types.ObjectId;
  try {
    objectId = new Types.ObjectId(id);
  } catch {
    throw new Error("Invalid provider ID");
  }

  const [providerData] = await Provider.aggregate([
    // Match by userId (User._id) OR _id (Provider._id) — handles both call sites
    { $match: { $or: [{ userId: objectId }, { _id: objectId }] } },
    { $limit: 1 },
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
        from: "categories",
        localField: "serviceCategories",
        foreignField: "_id",
        as: "categoriesDetails",
      },
    },
    // Fetch only VISIBLE feedbacks, sorted newest-first
    {
      $lookup: {
        from: "feedbacks",
        let: { pid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$providerId", "$$pid"] },
                  { $eq: ["$status", "VISIBLE"] },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
        ],
        as: "allFeedbacks",
      },
    },
    {
      $addFields: {
        allRatings: {
          $reduce: {
            input: "$allFeedbacks.servicesFeedbacks",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
        // Keep only the IDs of the 5 most-recent feedbacks for the secondary query
        recentFeedbackIds: {
          $slice: [
            { $map: { input: "$allFeedbacks", as: "f", in: "$$f._id" } },
            5,
          ],
        },
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
        reviewCount: { $size: "$allFeedbacks" },
        recentFeedbackIds: 1,
      },
    },
  ]);

  if (!providerData) throw new Error("Provider not found");

  // Secondary query with populate — simpler than a nested $lookup + $unwind
  const recentFeedbacks = await FeedbackModel.find({
    _id: { $in: providerData.recentFeedbackIds },
  })
    .sort({ createdAt: -1 })
    .populate("customerId", "fullName avatar")
    .lean();

  const { recentFeedbackIds: _omit, ...profile } = providerData;
  return { ...profile, recentFeedbacks };
};
