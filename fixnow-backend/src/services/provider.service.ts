/** Core provider CRUD — search is in provider-search.service.ts, public profile in provider-public-profile.service.ts */
import { Provider } from "../models/provider.model";
import Request from "../models/request.model";
import Feedback from "../models/feedback.model";
import User from "../models/user.model";
import { WithdrawRequest } from "../models/withdrawRequest.model";

export const getProviderByUserId = async (userId: string) => {
  const provider = await Provider.findOne({ userId })
    .populate("serviceCategories", "name type")
    .lean();
  if (!provider) throw new Error("Provider not found");
  const [user, completedJobs, ratingResult, bankAccount] = await Promise.all([
    User.findById(userId).select("fullName email phone avatar status").lean(),
    Request.countDocuments({ providerId: userId, status: "COMPLETED" }),
    Feedback.aggregate([
      { $match: { providerId: provider._id, status: "VISIBLE" } },
      { $unwind: "$servicesFeedbacks" },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$servicesFeedbacks.rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
    WithdrawRequest.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("bankName accountNumber accountHolder")
      .lean(),
  ]);
  if (!user) throw new Error("User not found");

  return {
    ...provider,
    user,
    stats: {
      completedJobs,
      averageRating: Number((ratingResult[0]?.averageRating ?? 0).toFixed(1)),
      totalReviews: ratingResult[0]?.totalReviews ?? 0,
    },
    bankAccount,
  };
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
  if (!provider) throw new Error("Provider not found");
  return provider;
};

export const updateWorkingArea = async (userId: string, workingAreas: string[]) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    { workingAreas },
    { new: true }
  );
  if (!provider) throw new Error("Provider not found");
  return provider;
};

export const updateProviderProfile = async (
  userId: string,
  data: {
    description?: string;
    experienceYears?: number;
    serviceCategories?: string[];
    workingAreas?: string[];
    operatingRadiusKm?: number;
    workingSchedule?: {
      weekdays: { enabled: boolean; start: string; end: string };
      saturday: { enabled: boolean; start: string; end: string };
      sunday: { enabled: boolean; start: string; end: string };
    };
  },
) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.experienceYears !== undefined && { experienceYears: data.experienceYears }),
        ...(data.serviceCategories !== undefined && { serviceCategories: data.serviceCategories }),
        ...(data.workingAreas !== undefined && { workingAreas: data.workingAreas }),
        ...(data.operatingRadiusKm !== undefined && { operatingRadiusKm: data.operatingRadiusKm }),
        ...(data.workingSchedule !== undefined && { workingSchedule: data.workingSchedule }),
      },
    },
    { new: true, runValidators: true },
  ).populate("serviceCategories", "name type");
  if (!provider) throw new Error("Provider not found");
  return provider;
};
