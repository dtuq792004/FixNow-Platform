import bcrypt from "bcrypt";
import Category from "../models/category.model";
import { Complaint } from "../models/complaint.model";
import Feedback from "../models/feedback.model";
import { Payment } from "../models/payment.model";
import { PlatformSetting } from "../models/platformSetting.model";
import RequestModel from "../models/request.model";
import Service from "../models/service.model";
import User from "../models/user.model";
import { Provider } from "../models/provider.model";
import { WithdrawRequest } from "../models/withdrawRequest.model";

const pagination = (page = 1, limit = 10) => ({
  page: Math.max(1, page),
  limit: Math.min(100, Math.max(1, limit)),
});

export const getDashboard = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalProviders,
    totalRequests,
    pendingRequests,
    revenue,
    revenueByDay,
    latestRequests,
    topProviders,
  ] = await Promise.all([
    User.countDocuments({ role: "CUSTOMER" }),
    User.countDocuments({ role: "PROVIDER" }),
    RequestModel.countDocuments(),
    RequestModel.countDocuments({ status: { $in: ["AWAITING_PAYMENT", "PENDING"] } }),
    Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, gross: { $sum: "$amount" }, platform: { $sum: "$platformFee" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "SUCCESS", createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, value: { $sum: "$platformFee" } } },
      { $sort: { _id: 1 } },
    ]),
    RequestModel.find()
      .populate("customerId", "fullName")
      .populate("services", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Payment.aggregate([
      { $match: { status: "SUCCESS", providerId: { $exists: true } } },
      { $group: { _id: "$providerId", revenue: { $sum: "$providerAmount" }, completed: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $lookup: { from: "providers", localField: "_id", foreignField: "userId", as: "provider" } },
      { $unwind: { path: "$provider", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "provider.serviceCategories", foreignField: "_id", as: "categories" } },
      { $project: { name: "$user.fullName", revenue: 1, completed: 1, category: { $arrayElemAt: ["$categories.name", 0] } } },
    ]),
  ]);

  return {
    summary: {
      totalUsers,
      totalProviders,
      totalRequests,
      pendingRequests,
      grossRevenue: revenue[0]?.gross ?? 0,
      platformRevenue: revenue[0]?.platform ?? 0,
    },
    revenueByDay,
    latestRequests,
    topProviders,
  };
};

export const getCategories = async () => {
  return Category.aggregate([
    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "categoryId",
        as: "services",
      },
    },
    {
      $lookup: {
        from: "requests",
        localField: "_id",
        foreignField: "categoryId",
        as: "requests",
      },
    },
    {
      $project: {
        name: 1,
        type: 1,
        description: 1,
        iconUrl: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        serviceCount: { $size: "$services" },
        requestCount: { $size: "$requests" },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
};

export const getServices = async (query: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const { page, limit } = pagination(query.page, query.limit);
  const filter: any = {};

  if (query.status && query.status !== "ALL") filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Service.find(filter)
      .populate("providerId", "fullName email avatar")
      .populate("categoryId", "name type iconUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Service.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getRequests = async (query: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const { page, limit } = pagination(query.page, query.limit);
  const filter: any = {};
  if (query.status && query.status !== "ALL") filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }
  const [items, total] = await Promise.all([
    RequestModel.find(filter)
      .populate("customerId", "fullName email")
      .populate("providerId", "fullName email")
      .populate("services", "name")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    RequestModel.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getPayments = async (query: { page?: number; limit?: number; status?: string; search?: string }) => {
  const { page, limit } = pagination(query.page, query.limit);
  const filter: any = {};
  if (query.status && query.status !== "ALL") filter.status = query.status;
  if (query.search) {
    const numeric = Number(query.search);
    filter.$or = [
      { transactionRef: { $regex: query.search, $options: "i" } },
      ...(Number.isFinite(numeric) ? [{ orderCode: numeric }] : []),
    ];
  }
  const [items, total, totals] = await Promise.all([
    Payment.find(filter)
      .populate("customerId", "fullName email")
      .populate("providerId", "fullName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
    Payment.aggregate([
      { $group: {
        _id: null,
        total: { $sum: "$amount" },
        paid: { $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, "$amount", 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0] } },
      } },
    ]),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit), summary: totals[0] ?? { total: 0, paid: 0, pending: 0 } };
};

export const getFeedbacks = async (query: { page?: number; limit?: number; status?: string }) => {
  const { page, limit } = pagination(query.page, query.limit);
  const filter = query.status && query.status !== "ALL" ? { status: query.status } : {};
  const [items, total, stats] = await Promise.all([
    Feedback.find(filter)
      .populate("customerId", "fullName email")
      .populate({ path: "providerId", populate: { path: "userId", select: "fullName email" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(filter),
    Feedback.aggregate([
      { $unwind: "$servicesFeedbacks" },
      { $group: { _id: null, average: { $avg: "$servicesFeedbacks.rating" }, ratings: { $sum: 1 }, hidden: { $sum: { $cond: [{ $eq: ["$status", "HIDDEN"] }, 1, 0] } } } },
    ]),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit), summary: stats[0] ?? { average: 0, ratings: 0, hidden: 0 } };
};

export const updateFeedbackStatus = (id: string, status: "VISIBLE" | "HIDDEN") =>
  Feedback.findByIdAndUpdate(id, { status }, { new: true });

export const getComplaints = async (query: { page?: number; limit?: number; status?: string }) => {
  const { page, limit } = pagination(query.page, query.limit);
  const filter = query.status && query.status !== "ALL" ? { status: query.status } : {};
  const result = await Complaint.paginate(filter, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: [
      { path: "customerId", select: "fullName email" },
      { path: "providerId", select: "fullName email" },
      { path: "requestId", select: "title description finalPrice status media completionMedia" },
    ],
  });
  return { items: result.docs, total: result.totalDocs, page: result.page, limit: result.limit, totalPages: result.totalPages };
};

export const updateComplaintStatus = (id: string, status: "OPEN" | "PROCESSING" | "RESOLVED", adminId: string) =>
  Complaint.findByIdAndUpdate(id, { status, handledBy: adminId }, { new: true });

export const getAnalytics = async () => {
  const [revenueByMonth, categoryUsage, completedJobs, ratings, newUsers, withdrawals] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$platformFee" } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    RequestModel.aggregate([
      { $group: { _id: "$categoryId", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
      { $project: { name: { $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, "Khác"] }, total: 1 } },
    ]),
    RequestModel.countDocuments({ status: "COMPLETED" }),
    Feedback.aggregate([{ $unwind: "$servicesFeedbacks" }, { $group: { _id: null, average: { $avg: "$servicesFeedbacks.rating" } } }]),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } }),
    WithdrawRequest.aggregate([{ $group: { _id: "$status", amount: { $sum: "$amount" }, count: { $sum: 1 } } }]),
  ]);
  return { revenueByMonth, categoryUsage, completedJobs, averageRating: ratings[0]?.average ?? 0, newUsers, withdrawals };
};

export const getSettings = async () => {
  let setting = await PlatformSetting.findOne();
  if (!setting) setting = await PlatformSetting.create({});
  return setting;
};

export const updateSettings = async (adminId: string, data: { platformFeePercent: number; minWithdrawAmount: number; terms?: string }) => {
  return PlatformSetting.findOneAndUpdate(
    {},
    { ...data, updatedBy: adminId },
    { new: true, upsert: true, runValidators: true },
  );
};

export const createAdmin = async (data: { fullName: string; email: string }) => {
  if (await User.exists({ email: data.email.toLowerCase() })) throw new Error("Email đã tồn tại");
  const temporaryPassword = `FixNow@${Math.random().toString(36).slice(-8)}`;
  const user = await User.create({
    fullName: data.fullName,
    email: data.email,
    passwordHash: await bcrypt.hash(temporaryPassword, 10),
    role: "ADMIN",
    status: "ACTIVE",
    isEmailVerified: true,
  });
  return { user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role }, temporaryPassword };
};

export const getSystemCounts = async () => Promise.all([
  Service.countDocuments(),
  Provider.countDocuments(),
]);
