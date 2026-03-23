import Request from "../models/request.model";

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
    .populate("categoryId", "name")
    .sort({ createdAt: -1 });
};

export const getRequestById = async (requestId: string, customerId: string) => {
  const request = await Request.findOne({ _id: requestId, customerId })
    .populate("providerId", "fullName avatar phone")
    .populate("categoryId", "name");

  if (!request) throw new Error("Request not found");
  return request;
};
