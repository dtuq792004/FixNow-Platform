import mongoose from "mongoose";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { PaymentService } from "./payment.service";

export const cancelRequest = async (requestId: string, customerId: string) => {
  const request = await Request.findById(requestId);

  if (!request) throw new Error("Request not found");
  if (request.customerId.toString() !== customerId) throw new Error("Not authorized");
  if (!["AWAITING_PAYMENT", "PENDING", "ACCEPTED", "IN_PROGRESS"].includes(request.status)) {
    throw new Error("Cannot cancel this request");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    request.status = "CANCELLED";
    await request.save({ session });

    const payment = await Payment.findOne({
      requestId: request._id,
      status: "SUCCESS",
    }).session(session);

    if (payment) {
      await PaymentService.refund(payment._id.toString());
    }

    await session.commitTransaction();
    return request;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const respondRequest = async (
  requestId: string,
  providerId: string,
  action: "ACCEPT" | "REJECT",
) => {
  const request = await Request.findById(requestId);

  if (!request) throw new Error("Request not found");
  if (request.status !== "PENDING") throw new Error("Request is no longer available");
  if (action === "REJECT") return request;

  request.status = "ACCEPTED";
  request.providerId = new mongoose.Types.ObjectId(providerId);

  const payment = await Payment.findOne({ requestId: request._id, status: "SUCCESS" });
  if (payment) {
    payment.providerId = request.providerId;
    await payment.save();

    await mongoose.model("Wallet").updateOne(
      { userId: providerId },
      { $inc: { pending: payment.providerAmount, totalEarned: payment.providerAmount } },
      { upsert: true },
    );
  }

  await request.save();
  return request;
};

export const startService = async (requestId: string, providerId: string) => {
  const request = await Request.findById(requestId);
  if (!request) throw new Error("Request not found");
  if (request.status !== "ACCEPTED") throw new Error("Cannot start service");

  request.status = "IN_PROGRESS";
  await request.save();
  return request;
};

export const completeService = async (
  requestId: string,
  providerId: string,
  media: string[],
  note?: string,
) => {
  const request = await Request.findById(requestId);
  if (!request) throw new Error("Request not found");
  if (request.status !== "IN_PROGRESS") throw new Error("Cannot complete service");

  request.status = "COMPLETED";
  request.providerCompletedAt = new Date();
  request.completionMedia = media;
  if (note) request.completionNote = note;

  await request.save();
  return request;
};
