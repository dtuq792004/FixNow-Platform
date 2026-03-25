import { ProviderRequest } from "../models/providerRequest.model";
import { Provider } from "../models/provider.model";
import { Types } from "mongoose";
import { ProviderRequestStatus } from "../models/providerRequest.model";
import User from "../models/user.model";
import Category from "../models/category.model";

export const createProviderRequest = async (userId: string, data: any) => {
  const existing = await ProviderRequest.findOne({
    userId,
    status: "PENDING",
  });

  if (existing) {
    throw new Error("Provider request already pending");
  }

  // Map frontend data to backend model
  const mappedData = {
    userId,
    fullName: data.fullName,
    phone: data.phone,
    experience: data.experience,
    specialties: data.specialties,
    serviceArea: data.serviceArea,
    idCard: data.idCard,
    motivation: data.motivation,
  };

  const request = await ProviderRequest.create(mappedData);

  return request;
};

// Helper function to parse experience text to years
const parseExperienceYears = (experience: string): number => {
  // Extract number from experience string like "3 năm", "5+ năm", etc.
  const match = experience.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

export const getMyProviderRequest = async (userId: string) => {
  const request = await ProviderRequest.findOne({ userId })
    .populate("userId", "fullName email phone")
    .sort({ createdAt: -1 });

  if (!request) {
    throw new Error("No provider request found");
  }

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
      .populate("specialties", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ProviderRequest.countDocuments(filter),
    ProviderRequest.countDocuments({ ...filter, status: "PENDING" }),
    ProviderRequest.countDocuments({ ...filter, status: "APPROVED" }),
    ProviderRequest.countDocuments({ ...filter, status: "REJECTED" })
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
  console.log(`Approving request ${requestId} by admin ${adminId}`);
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

  // Look up real Category ObjectIds matching the specialty IDs
  const categories = await Category.find({ _id: { $in: request.specialties } });

  // Use findOneAndUpdate with upsert to avoid duplicate userId error
  const provider = await Provider.findOneAndUpdate(
    { userId: request.userId },
    {
      userId: request.userId,
      description: request.motivation || request.experience,
      experienceYears: parseExperienceYears(request.experience),
      serviceCategories: categories.map((c) => c._id as Types.ObjectId),
      workingAreas: [request.serviceArea],
      verified: true,
    },
    { upsert: true, new: true }
  );

  await User.findByIdAndUpdate(request.userId, {
    role: "PROVIDER",
  });

  return { request, provider };
};

export const rejectProviderRequest = async (
  requestId: string,
  adminId: string,
  rejectionReason?: string
) => {
  const request = await ProviderRequest.findById(requestId);

  if (!request) {
    throw new Error("Provider request not found");
  }

  request.status = ProviderRequestStatus.REJECTED;
  request.reviewedBy = new Types.ObjectId(adminId);
  request.reviewedAt = new Date();
  request.rejectionReason = rejectionReason;

  await request.save();

  return request;
};