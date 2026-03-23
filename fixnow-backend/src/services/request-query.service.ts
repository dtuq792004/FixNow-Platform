import Request from "../models/request.model";
import { Types } from "mongoose";

export const getMyRequests = async (customerId: string) => {
  return Request.find({ customerId })
    .populate("providerId", "fullName avatar")
    .populate("categoryId", "name")
    .sort({ createdAt: -1 });
};

export const getAvailableRequests = async () => {
  return Request.find({ status: "PENDING" })
    .populate("customerId", "fullName avatar")
    .populate("addressId")
    .populate("categoryId", "name type")
    .sort({ createdAt: -1 });
};

export const getMyProviderJobs = async (providerId: string) => {
  return Request.find({
    providerId,
    status: { $in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
  })
    .populate("customerId", "fullName avatar")
    .populate("addressId")
    .populate("categoryId", "name type")
    .sort({ createdAt: -1 });
};

export const getRequestById = async (requestId: string, customerId: string) => {
  const request = await Request.findOne({ _id: requestId, customerId })
    .populate("providerId", "fullName avatar phone")
    .populate("categoryId", "name");

  if (!request) throw new Error("Request not found");
  return request;
};

/**
 * Provider fetches a single job — either a still-PENDING (available) request
 * or one that is already assigned to this provider.
 */
export const getProviderJobById = async (requestId: string, providerId: string) => {
  const request = await Request.findOne({
    _id: requestId,
    $or: [
      { status: "PENDING" },
      { providerId: new Types.ObjectId(providerId) },
    ],
  })
    .populate("customerId", "fullName avatar phone")
    .populate("addressId")
    .populate("categoryId", "name type");

  if (!request) throw new Error("Job not found");
  return request;
};
