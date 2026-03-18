import mongoose from "mongoose";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { settlePayment } from "./settlement.service";

export class RequestService {

  static async providerComplete(id: string) {
    const request = await Request.findById(id);
    request!.status = "COMPLETED";
    request!.providerCompletedAt = new Date();
    await request!.save();
  }

  static async customerConfirm(id: string) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const sr = await Request.findById(id).session(session);
      sr!.customerConfirmedAt = new Date();
      await sr!.save({ session });

      const payment = await Payment.findOne({
        requestId: sr!._id,
        status: "SUCCESS"
      }).session(session);

      await settlePayment(payment);

      await session.commitTransaction();

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
  
}

export const createRequest = async (customerId: string, data: any) => {
  return Request.create({
    ...data,
    customerId,
    status: "PENDING",
    requestType: data.requestType || "NORMAL"
  });
};

export const getMyRequests = async (customerId: string) => {
  return Request.find({ customerId })
    .populate("serviceId providerId")
    .sort({ createdAt: -1 });
};

export const cancelRequest = async (requestId: string, customerId: string) => {
  const request = await Request.findById(requestId);

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.customerId.toString() !== customerId) {
    throw new Error("Not authorized");
  }

  if (!["PENDING", "ACCEPTED"].includes(request.status)) {
    throw new Error("Cannot cancel this request");
  }

  request.status = "CANCELLED";
  await request.save();

  return request;
};

export const getAvailableRequests = async () => {
  return Request.find({ status: "PENDING" })
    .populate("serviceId customerId addressId")
    .sort({ createdAt: -1 });
};

export const respondRequest = async (
  requestId: string,
  providerId: string,
  action: "ACCEPT" | "REJECT"
) => {
  const request = await Request.findById(requestId);

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request is no longer available");
  }

  if (action === "ACCEPT") {
    request.status = "ACCEPTED";
    request.providerId = new mongoose.Types.ObjectId(providerId);
  }

  if (action === "REJECT") {
    // giữ PENDING để provider khác nhận
    return request;
  }

  await request.save();
  return request;
};

export const startService = async (requestId: string, providerId: string) => {
  const request = await Request.findById(requestId);

  if (!request) throw new Error("Request not found");

  if (request.status !== "ACCEPTED") {
    throw new Error("Cannot start service");
  }

  request.status = "IN_PROGRESS";
  await request.save();

  return request;
};

export const completeService = async (
  requestId: string,
  providerId: string,
  media: string[],
  note?: string
) => {
  const request = await Request.findById(requestId);

  if (!request) throw new Error("Request not found");

  if (request.status !== "IN_PROGRESS") {
    throw new Error("Cannot complete service");
  }
  request.status = "WAITING_CUSTOMER_CONFIRM";
  request.providerCompletedAt = new Date();
  request.completionMedia = media;

  if (note) request.completionNote = note;

  await request.save();

  return request;
};

export const confirmCompletion = async (
  requestId: string,
  customerId: string
) => {
  const request = await Request.findById(requestId);

  if (!request) throw new Error("Request not found");

  // check status
  if (request.status !== "WAITING_CUSTOMER_CONFIRM") {
    throw new Error("Service not ready for confirmation");
  }

  request.status = "COMPLETED";
  request.customerConfirmedAt = new Date();

  await request.save();

  return request;
};
