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
import { Blog } from "../models/blog.model";
import { BlogView } from "../models/blogView.model";

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

const REPORT_TIME_ZONE = "Asia/Bangkok";
const DAY_MS = 24 * 60 * 60 * 1000;

const dateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getWeekRange = (weekOffset = 0) => {
  const safeOffset = Math.min(0, Math.max(-520, Math.trunc(weekOffset)));
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(values.weekday);
  const daysSinceMonday = (weekday + 6) % 7;
  const localMidnightMarker = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day));
  const startMarker = new Date(localMidnightMarker - daysSinceMonday * DAY_MS + safeOffset * 7 * DAY_MS);
  const keys = Array.from({ length: 7 }, (_, index) => dateKey(new Date(startMarker.getTime() + index * DAY_MS)));
  return {
    start: new Date(`${keys[0]}T00:00:00+07:00`),
    end: new Date(`${keys[6]}T23:59:59.999+07:00`),
    keys,
    weekOffset: safeOffset,
  };
};

const dayLabel = (key: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: REPORT_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${key}T12:00:00+07:00`));

export const getBlogViewReport = async (weekOffset = 0) => {
  const range = getWeekRange(weekOffset);
  const [dailyRows, topBlogs, publishedBlogs, allTimeViewRows] = await Promise.all([
    BlogView.aggregate([
      { $match: { date: { $gte: range.keys[0], $lte: range.keys[6] } } },
      { $group: { _id: "$date", value: { $sum: "$count" } } },
      { $sort: { _id: 1 } },
    ]),
    BlogView.aggregate([
      { $match: { date: { $gte: range.keys[0], $lte: range.keys[6] } } },
      { $group: { _id: "$blogId", views: { $sum: "$count" } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $lookup: { from: "blogs", localField: "_id", foreignField: "_id", as: "blog" } },
      { $project: { title: { $ifNull: [{ $arrayElemAt: ["$blog.title", 0] }, "Bài viết đã xóa"] }, views: 1 } },
    ]),
    Blog.countDocuments({ status: "PUBLISHED" }),
    BlogView.aggregate([
      { $group: { _id: null, value: { $sum: "$count" } } },
    ]),
  ]);
  const values = new Map(dailyRows.map((row) => [row._id, row.value]));
  const daily = range.keys.map((date) => ({ date, label: dayLabel(date), value: values.get(date) ?? 0 }));
  return {
    weekOffset: range.weekOffset,
    startDate: range.keys[0],
    endDate: range.keys[6],
    daily,
    totalViews: daily.reduce((sum, item) => sum + item.value, 0),
    allTimeViews: allTimeViewRows[0]?.value ?? 0,
    publishedBlogs,
    topBlogs,
  };
};

export const getRevenueReport = async (weekOffset = 0) => {
  const range = getWeekRange(weekOffset);
  const rows = await Payment.aggregate([
    { $match: { status: "SUCCESS", createdAt: { $gte: range.start, $lte: range.end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: REPORT_TIME_ZONE } },
        grossRevenue: { $sum: "$amount" },
        platformRevenue: { $sum: "$platformFee" },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const values = new Map(rows.map((row) => [row._id, row]));
  const daily = range.keys.map((date) => ({
    date,
    label: dayLabel(date),
    grossRevenue: values.get(date)?.grossRevenue ?? 0,
    platformRevenue: values.get(date)?.platformRevenue ?? 0,
    transactions: values.get(date)?.transactions ?? 0,
  }));
  return {
    weekOffset: range.weekOffset,
    startDate: range.keys[0],
    endDate: range.keys[6],
    daily,
    totalGrossRevenue: daily.reduce((sum, item) => sum + item.grossRevenue, 0),
    totalPlatformRevenue: daily.reduce((sum, item) => sum + item.platformRevenue, 0),
    totalTransactions: daily.reduce((sum, item) => sum + item.transactions, 0),
  };
};

export const getCatalogReport = async () => {
  const [categories, serviceStatuses] = await Promise.all([
    Category.aggregate([
      { $lookup: { from: "services", localField: "_id", foreignField: "categoryId", as: "services" } },
      {
        $project: {
          name: 1,
          isActive: 1,
          totalServices: { $size: "$services" },
          approvedServices: {
            $size: {
              $filter: { input: "$services", as: "service", cond: { $eq: ["$$service.status", "APPROVED"] } },
            },
          },
        },
      },
      { $sort: { totalServices: -1, name: 1 } },
    ]),
    Service.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const statusMap = new Map(serviceStatuses.map((item) => [item._id, item.value]));
  return {
    totalCategories: categories.length,
    activeCategories: categories.filter((item) => item.isActive).length,
    totalServices: serviceStatuses.reduce((sum, item) => sum + item.value, 0),
    approvedServices: statusMap.get("APPROVED") ?? 0,
    categories,
    serviceStatuses: [
      { status: "APPROVED", label: "Đã duyệt", value: statusMap.get("APPROVED") ?? 0 },
      { status: "PENDING", label: "Chờ duyệt", value: statusMap.get("PENDING") ?? 0 },
      { status: "REJECTED", label: "Từ chối", value: statusMap.get("REJECTED") ?? 0 },
    ],
  };
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
