import { ProviderRequest } from "../models/providerRequest.model";
import { Provider } from "../models/provider.model";
import { Types } from "mongoose";
import { ProviderRequestStatus } from "../models/providerRequest.model";
import User from "../models/user.model";

export const createProviderRequest = async (userId: string, data: any) => {
  const existing = await ProviderRequest.findOne({
    userId,
    status: "PENDING",
  });

  if (existing) {
    throw new Error("Provider request already pending");
  }

  const request = await ProviderRequest.create({
    ...data,
    userId,
  });

  return request;
};

export const getProviderRequests = async (status?: string, page: number = 1, limit: number = 5, search?: string) => {
  const filter: any = {};
  const statsFilter: any = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    const users = await User.find({
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }).select('_id');
    const userIds = users.map(u => u._id);
    filter.userId = { $in: userIds };
    statsFilter.userId = { $in: userIds };
  }

  const skip = (page - 1) * limit;

  const [requests, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    ProviderRequest.find(filter)
      .populate("userId", "fullName email phone")
      .populate("serviceCategories", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ProviderRequest.countDocuments(filter),
    ProviderRequest.countDocuments({ ...statsFilter, status: "PENDING" }),
    ProviderRequest.countDocuments({ ...statsFilter, status: "APPROVED" }),
    ProviderRequest.countDocuments({ ...statsFilter, status: "REJECTED" })
  ]);

  return {
    requests,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: page,
    stats: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    }
  };
};

export const approveProviderRequest = async (
  requestId: string,
  adminId: string
) => {
  const request = await ProviderRequest.findById(requestId);

  if (!request) {
    throw new Error("Provider request not found");
  }

  if (request.status !== ProviderRequestStatus.PENDING) {
  throw new Error("Request already processed");
}

  request.status = ProviderRequestStatus.APPROVED;
  request.reviewedBy = new Types.ObjectId(adminId);
  request.reviewedAt = new Date();

  await request.save();

  const provider = await Provider.create({
    userId: request.userId,
    description: request.description,
    experienceYears: request.experienceYears,
    serviceCategories: request.serviceCategories,
    workingAreas: request.workingAreas,
    verified: true,
  });

   await User.findByIdAndUpdate(request.userId, {
    role: "PROVIDER",
  });

  return { request, provider };
};

export const rejectProviderRequest = async (
  requestId: string,
  adminId: string
) => {
  const request = await ProviderRequest.findById(requestId);

  if (!request) {
    throw new Error("Provider request not found");
  }

  request.status = ProviderRequestStatus.REJECTED;
  request.reviewedBy = new Types.ObjectId(adminId);
  request.reviewedAt = new Date();

  await request.save();

  return request;
};