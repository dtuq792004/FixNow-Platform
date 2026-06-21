import mongoose from "mongoose";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { PaymentService } from "./payment.service";
import { Provider } from "../models/provider.model";
import { ensureConversation } from "./chat.service";
import { sendRequestUpdatedRealtime } from "../sockets/notification.socket";

const assertProviderSupportsCategory = async (
  providerId: string,
  categoryId?: mongoose.Types.ObjectId,
) => {
  if (!categoryId) throw new Error("Request category is required");

  const provider = await Provider.exists({
    userId: new mongoose.Types.ObjectId(providerId),
    serviceCategories: categoryId,
  });

  if (!provider) {
    throw new Error("Provider does not support this request category");
  }
};

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
  await assertProviderSupportsCategory(providerId, request.categoryId);

  if (action === "REJECT") {
    await Request.updateOne(
      { _id: requestId, status: "PENDING" },
      { $addToSet: { rejectedProviderIds: new mongoose.Types.ObjectId(providerId) } },
    );
    return request;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const acceptedRequest = await Request.findOneAndUpdate(
      { _id: requestId, status: "PENDING" },
      {
        $set: {
          status: "ACCEPTED",
          providerId: new mongoose.Types.ObjectId(providerId),
        },
      },
      { new: true, session },
    );

    if (!acceptedRequest) throw new Error("Request is no longer available");

    const conversation = await ensureConversation(
      providerId,
      acceptedRequest.customerId.toString(),
      session,
    );
    acceptedRequest.conversationId = conversation._id as mongoose.Types.ObjectId;

    const payment = await Payment.findOne({
      requestId: acceptedRequest._id,
      status: "SUCCESS",
    }).session(session);
    if (payment) {
      payment.providerId = acceptedRequest.providerId;
      await payment.save({ session });

      await mongoose.model("Wallet").updateOne(
        { userId: providerId },
        { $inc: { pending: payment.providerAmount, totalEarned: payment.providerAmount } },
        { upsert: true, session },
      );
    }

    await acceptedRequest.save({ session });
    await session.commitTransaction();
    sendRequestUpdatedRealtime(acceptedRequest.customerId.toString(), {
      requestId: acceptedRequest._id.toString(),
      status: acceptedRequest.status,
      providerId: acceptedRequest.providerId?.toString(),
    });
    return acceptedRequest;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const startService = async (requestId: string, providerId: string) => {
  const request = await Request.findById(requestId);
  if (!request) throw new Error("Request not found");
  if (request.providerId?.toString() !== providerId) throw new Error("Not authorized");
  if (request.status !== "ACCEPTED") throw new Error("Cannot start service");

  request.status = "IN_PROGRESS";
  await request.save();
  sendRequestUpdatedRealtime(request.customerId.toString(), {
    requestId: request._id.toString(),
    status: request.status,
    providerId: request.providerId?.toString(),
  });
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
  if (request.providerId?.toString() !== providerId) throw new Error("Not authorized");
  if (request.status !== "IN_PROGRESS") throw new Error("Cannot complete service");

  request.status = "COMPLETED";
  request.providerCompletedAt = new Date();
  request.completionMedia = media;
  if (note) request.completionNote = note;

  await request.save();
  sendRequestUpdatedRealtime(request.customerId.toString(), {
    requestId: request._id.toString(),
    status: request.status,
    providerId: request.providerId?.toString(),
  });
  return request;
};
