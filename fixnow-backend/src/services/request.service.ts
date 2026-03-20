import mongoose from "mongoose";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { settlePayment } from "./settlement.service";
import { PaymentService } from "./payment.service";
import { calculatePayment } from "../utils/calculate.util";
import Service from "../models/service.model";

export const createRequest = async (customerId: string, data: any) => {
  const { promoCode, services } = data; // services = array of serviceId

  if (!services || services.length === 0) {
    throw new Error("Services are required");
  }

  const serviceDocs = await Service.find({
    _id: { $in: services },
  });

  if (serviceDocs.length !== services.length) {
    throw new Error("Some services not found");
  }

  const totalPrice = serviceDocs.reduce((sum, s) => sum + s.price, 0);

  let discountAmount = 0;
  let finalPrice = totalPrice;
  let appliedPromoCode = "";

  if (promoCode && promoCode.trim() !== "") {
    const calculation = await calculatePayment(totalPrice, promoCode);

    discountAmount = calculation.discountAmount;
    finalPrice = calculation.finalAmount;
    appliedPromoCode = calculation.discountCode as string;
  }

  const request = await Request.create({
    customerId,
    services,
    addressId: data.addressId,
    requestType: data.requestType || "NORMAL",
    description: data.description,
    media: data.media,

    startAt: data.startAt,

    status: "AWAITING_PAYMENT",

    totalPrice,
    discountAmount,
    finalPrice,
    promoCode: appliedPromoCode,
  });

  const checkoutUrl = await PaymentService.createPayment(request);

  return {
    request,
    checkoutUrl,
  };
};

export const getMyRequests = async (customerId: string) => {
  return Request.find({ customerId })
    .populate("providerId")
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

export const getAvailableRequests = async () => {
  return Request.find({ status: "PENDING" })
    .populate("customerId addressId")
    .sort({ createdAt: -1 });
};

export const respondRequest = async (
  requestId: string,
  providerId: string,
  action: "ACCEPT" | "REJECT",
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
    const payment = await Payment.findOne({
      requestId: request._id,
      status: "SUCCESS",
    });
    if (payment) {
      payment.providerId = request.providerId;
      await payment.save();

      // Cộng vào ví pending của thợ
      await mongoose.model("Wallet").updateOne(
        { userId: providerId },
        {
          $inc: {
            pending: payment.providerAmount,
            totalEarned: payment.providerAmount,
          },
        },
        { upsert: true },
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
  note?: string,
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
