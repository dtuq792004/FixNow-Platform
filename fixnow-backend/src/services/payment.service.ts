import mongoose from "mongoose";
import { payos } from "../configs/payos.config";
import { Payment } from "../models/payment.model";
import { Wallet } from "../models/wallet.model";
import { Promotion } from "../models/promotion.model";
import { calculatePayment } from "../utils/calculate.util";

export class PaymentService {

  /*
  CREATE PAYMENT
  */
  static async createPayment(request: any, promoCode?: string) {

    // 1️⃣ Tính toán payment (Sử dụng giá đã chốt nếu có)
    let amountToPay = request.finalPrice;
    let discountCode = request.promoCode;
    let discountAmount = request.discountAmount;
    let originalAmount = request.originalPrice;

    // Nếu request chưa có giá chốt (trường hợp cũ), mới thực hiện tính toán lại
    if (amountToPay === undefined || amountToPay === null) {
      const calculation = await calculatePayment(request.price, promoCode);
      amountToPay = calculation.finalAmount;
      discountCode = calculation.discountCode;
      discountAmount = calculation.discountAmount;
      originalAmount = calculation.originalAmount;
    }

    // Tạo orderCode ngẫu nhiên
    const baseCode = Date.now() % 1000000000;
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    const orderCode = Number(`${baseCode}${randomSuffix}`);

    // 2️⃣ Tạo payment record
    const payment = await Payment.create({
      requestId: request._id,
      customerId: request.customerId,
      providerId: request.providerId,
      orderCode,

      amount: amountToPay,

      // Phí nền tảng (Ví dụ 20%)
      platformFee: amountToPay * 0.2,
      providerAmount: amountToPay * 0.8,

      status: "PENDING"
    });

    // 3️⃣ Tạo PayOS checkout
    const response = await payos.paymentRequests.create({
      orderCode: orderCode,
      amount: amountToPay,
      description: `Thanh toan SR ${String(request._id).slice(-6)}`,
      returnUrl: process.env.PAYOS_RETURN_URL!,
      cancelUrl: process.env.PAYOS_CANCEL_URL!
    });

    return response.checkoutUrl;
  }


  /*
  HANDLE WEBHOOK FROM PAYOS
  */
  static async handleWebhook(rawBody: any) {
    let webhookData;
    try {
      if (process.env.NODE_ENV === "development" && !rawBody.signature) {
        webhookData = rawBody.data; 
      } else {
        webhookData = await payos.webhooks.verify(rawBody);
      }
    } catch (error) {
      console.error("Webhook verification failed:", error);
      throw error;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const payment = await Payment.findOneAndUpdate(
        { orderCode: webhookData.orderCode, status: "PENDING" },
        { status: "PROCESSING" },
        { session, returnDocument: 'after' }
      );

      if (!payment) {
        console.log(`Webhook ignored: OrderCode ${webhookData.orderCode} already processed or not found.`);
        await session.commitTransaction();
        return; 
      }

      if (webhookData.code === "00") {

        payment.status = "SUCCESS";
        payment.transactionRef = webhookData.reference;
        await payment.save({ session });

        // ✅ Cập nhật trạng thái của Request dựa trên việc có thợ hay chưa
        const request = await mongoose.model("Request").findById(payment.requestId).session(session);
        
        if (request) {
          // Nếu đã có providerId (đặt trực tiếp thợ), chuyển sang ACCEPTED
          // Nếu chưa có (đặt công khai), chuyển sang PENDING để hiện lên chợ việc
          const nextStatus = request.providerId ? "ACCEPTED" : "PENDING";
          request.status = nextStatus;
          await request.save({ session });
        }

        /*
        Tăng usedCount promo từ thông tin trong Request (Source of Truth)
        */
        if (request && request.promoCode) {
          await Promotion.updateOne(
            { code: request.promoCode },
            { $inc: { usedCount: 1 } },
            { session }
          );
        }
      }
      else {
        payment.status = "FAILED";
        await payment.save({ session });
      }

      await session.commitTransaction();

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


  /*
  REFUND PAYMENT
  */
  static async refund(paymentId: string) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const payment = await Payment.findById(paymentId).session(session);

      if (!payment) {
        throw new Error("Payment not found");
      }

      const request = await mongoose.model("Request").findById(payment.requestId).session(session);

      if (payment.status !== "SUCCESS") {
        throw new Error("Only successful payments can be refunded");
      }

      payment.status = "REFUNDED";
      await payment.save({ session });

      // Cập nhật lại trạng thái Request
      if (request) {
        request.status = "CANCELLED";
        await request.save({ session });
      }

      /*
      trừ tiền khỏi wallet provider
      */
      await Wallet.updateOne(
        { userId: payment.providerId },
        {
          $inc: {
            pending: -payment.providerAmount,
            totalEarned: -payment.providerAmount
          }
        },
        { session }
      );

      /*
      Cộng tiền lại cho wallet customer
      */
      await Wallet.updateOne(
        { userId: payment.customerId },
        {
          $inc: {
            balance: payment.amount
          }
        },
        { 
          upsert: true,
          session 
        }
      );

      /*
      Hoàn lại lượt sử dụng cho mã giảm giá (lấy từ Request)
      */
      if (request && request.promoCode) {
        await Promotion.updateOne(
          { code: request.promoCode },
          { $inc: { usedCount: -1 } },
          { session }
        );
      }

      await session.commitTransaction();

    } catch (error) {

      await session.abortTransaction();
      throw error;

    } finally {

      session.endSession();

    }
  }

}