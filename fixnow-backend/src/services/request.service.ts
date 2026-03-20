import mongoose from "mongoose";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { settlePayment } from "./settlement.service";
import { PaymentService } from "./payment.service";
import { calculatePayment } from "../utils/calculate.util";

export class RequestService {

  static async providerComplete(id: string) {
    const request = await Request.findById(id);
    request!.status = "COMPLETED";
    request!.providerCompletedAt = new Date();
    await request!.save();
  }
}

export const createRequest = async (customerId: string, data: any) => {
  const { promoCode, price } = data;

  const calculation = await calculatePayment(price, promoCode);

  const request = await Request.create({
    ...data,
    customerId,
    status: "AWAITING_PAYMENT",
    requestType: data.requestType || "NORMAL",

    originalPrice: calculation.originalAmount,
    discountAmount: calculation.discountAmount,
    finalPrice: calculation.finalAmount,
    promoCode: calculation.discountCode
  });

  const checkoutUrl = await PaymentService.createPayment(request);

  return {
    request,
    checkoutUrl
  };
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

  if (!["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(request.status)) {
    throw new Error("Cannot cancel this request");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    request.status = "CANCELLED";
    await request.save({ session });

    // Check payment if status was IN_PROGRESS (paid)
    const payment = await Payment.findOne({
      requestId: request._id,
      status: "SUCCESS"
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

    // ✅ Nếu request này đã được thanh toán trước (status lúc này là PENDING)
    // thì ta cần gán thợ vào Payment record và cộng tiền vào ví pending của thợ.
    const payment = await Payment.findOne({ requestId: request._id, status: "SUCCESS" });
    if (payment) {
      payment.providerId = request.providerId;
      await payment.save();

      // Cộng vào ví pending của thợ
      await mongoose.model("Wallet").updateOne(
        { userId: providerId },
        {
          $inc: {
            pending: payment.providerAmount,
            totalEarned: payment.providerAmount
          }
        },
        { upsert: true }
      );
    }
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
  request.status = "COMPLETED";
  request.providerCompletedAt = new Date();
  request.completionMedia = media;

  if (note) request.completionNote = note;

  await request.save();

  return request;
};

