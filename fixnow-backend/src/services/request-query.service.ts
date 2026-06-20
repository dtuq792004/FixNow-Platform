import Request from "../models/request.model";
import { Types } from "mongoose";
import { Provider } from "../models/provider.model";

const getProviderCategoryIds = async (providerId: string) => {
  const provider = await Provider.findOne({ userId: providerId })
    .select("serviceCategories")
    .lean();

  if (!provider) throw new Error("Provider not found");
  return provider.serviceCategories;
};

export const getMyRequests = async (customerId: string) => {
  return Request.find({ customerId })
    .populate("providerId", "fullName avatar")
    .populate("categoryId", "name")
    .populate("addressId")
    .populate("services", "name price")
    .sort({ createdAt: -1 });
};

export const getAvailableRequests = async (providerId: string) => {
  const categoryIds = await getProviderCategoryIds(providerId);

  return Request.find({
    status: "PENDING",
    categoryId: { $in: categoryIds },
    rejectedProviderIds: { $ne: new Types.ObjectId(providerId) },
  })
    .populate("customerId", "fullName avatar")
    .populate("addressId")
    .populate("categoryId", "name type")
    .sort({ createdAt: -1 });
};

export const getMyProviderJobs = async (providerId: string) => {
  const categoryIds = await getProviderCategoryIds(providerId);

  return Request.find({
    providerId,
    categoryId: { $in: categoryIds },
    status: { $in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
  })
    .populate("customerId", "fullName avatar")
    .populate("addressId")
    .populate("categoryId", "name type")
    .sort({ createdAt: -1 });
};

const providerJobStatuses = ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export const getProviderJobs = async (
  providerId: string,
  status: string = "ALL",
  page: number = 1,
  limit: number = 9,
) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const providerObjectId = new Types.ObjectId(providerId);
  const categoryIds = await getProviderCategoryIds(providerId);
  const visibilityFilter = {
    $or: [
      {
        status: "PENDING",
        categoryId: { $in: categoryIds },
        rejectedProviderIds: { $ne: providerObjectId },
      },
      {
        providerId: providerObjectId,
        categoryId: { $in: categoryIds },
        status: { $in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
      },
    ],
  };
  const filter = status !== "ALL" && providerJobStatuses.includes(status as typeof providerJobStatuses[number])
    ? { $and: [visibilityFilter, { status }] }
    : visibilityFilter;

  const [docs, totalDocs, statusCountsResult] = await Promise.all([
    Request.find(filter)
      .populate("customerId", "fullName avatar")
      .populate("addressId")
      .populate("categoryId", "name type")
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    Request.countDocuments(filter),
    Request.aggregate([
      { $match: visibilityFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = Object.fromEntries(providerJobStatuses.map((value) => [value, 0])) as Record<string, number>;
  for (const item of statusCountsResult) statusCounts[item._id] = item.count;

  return {
    docs,
    totalDocs,
    limit: safeLimit,
    totalPages: Math.ceil(totalDocs / safeLimit),
    page: safePage,
    statusCounts: {
      ...statusCounts,
      ALL: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
    },
  };
};

export const getRequestById = async (requestId: string, customerId: string) => {
  const request = await Request.findOne({ _id: requestId, customerId })
    .populate("providerId", "fullName avatar phone")
    .populate("categoryId", "name")
    .populate("addressId")
    .populate("services", "name price");

  if (!request) throw new Error("Request not found");
  return request;
};

/**
 * Provider fetches a single job — either a still-PENDING (available) request
 * or one that is already assigned to this provider.
 */
export const getProviderJobById = async (requestId: string, providerId: string) => {
  const categoryIds = await getProviderCategoryIds(providerId);

  const request = await Request.findOne({
    _id: requestId,
    $or: [
      {
        status: "PENDING",
        categoryId: { $in: categoryIds },
        rejectedProviderIds: { $ne: new Types.ObjectId(providerId) },
      },
      {
        providerId: new Types.ObjectId(providerId),
        categoryId: { $in: categoryIds },
      },
    ],
  })
    .populate("customerId", "fullName avatar phone")
    .populate("addressId")
    .populate("categoryId", "name type");

  if (!request) throw new Error("Job not found");
  return request;
};
