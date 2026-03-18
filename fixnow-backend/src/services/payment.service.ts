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

    // 1️⃣ Tính toán payment
    const calculation = await calculatePayment(request.price, promoCode);

    // Tạo orderCode ngẫu nhiên và duy nhất trong giới hạn 9007199254740991
    const baseCode = Date.now() % 1000000000;
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    const orderCode = Number(`${baseCode}${randomSuffix}`);

    // 2️⃣ Tạo payment record
    const payment = await Payment.create({
      requestId: request._id,
      customerId: request.customerId,
      providerId: request.providerId,
      orderCode,

      originalAmount: calculation.originalAmount,
      discountCode: calculation.discountCode,
      discountAmount: calculation.discountAmount,
      amount: calculation.finalAmount,

      platformFee: calculation.platformFee,
      providerAmount: calculation.providerAmount,

      status: "PENDING"
    });

    // 3️⃣ Tạo PayOS checkout
    const response = await payos.paymentRequests.create({
      orderCode: orderCode,
      amount: calculation.finalAmount,
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

    const webhookData = await payos.webhooks.verify(rawBody);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const payment = await Payment.findOneAndUpdate(
        { orderCode: webhookData.orderCode, status: "PENDING" },
        { status: "PROCESSING" },
        { session, new: true }
      );

      // Tránh xử lý webhook trùng (hoặc không tìm thấy)
      if (!payment) {
        await session.commitTransaction();
        return;
      }

      /*
      PAYMENT SUCCESS
      */
      if (webhookData.code === "00") {

        payment.status = "SUCCESS";
        payment.transactionRef = webhookData.reference;

        await payment.save({ session });

        // 0️⃣ Cập nhật trạng thái của Request
        await mongoose.model("Request").updateOne(
          { _id: payment.requestId },
          { status: "IN_PROGRESS" }, // Giả sử khi thanh toán xong chuyển sang tiến hành
          { session }
        );

        /*
        1️⃣ cộng tiền vào wallet provider
        */
        await Wallet.updateOne(
          { providerId: payment.providerId },
          {
            $inc: {
              pending: payment.providerAmount,
              totalEarned: payment.providerAmount
            }
          },
          {
            upsert: true,
            session
          }
        );

        /*
        2️⃣ tăng usedCount promo
        */
        if (payment.discountCode) {

          await Promotion.updateOne(
            { code: payment.discountCode },
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

      if (payment.status !== "SUCCESS") {
        throw new Error("Only successful payments can be refunded");
      }

      /*
      Cập nhật trạng thái Payment
      Lưu ý: Logic hoàn tiền thực tế cho PayOS có thể khác (thường ngân hàng xử lý offline hoặc API refund riêng biệt không phải API cancel).
      Ở đây chỉ cập nhật trạng thái trong hệ thống để ghi nhận Refund.
      */
      payment.status = "REFUNDED";
      await payment.save({ session });

      // Cập nhật lại trạng thái Request nếu cần (ví dụ CANCELLED)
      await mongoose.model("Request").updateOne(
        { _id: payment.requestId },
        { status: "CANCELLED" },
        { session }
      );

      /*
      trừ tiền khỏi wallet provider
      */
      await Wallet.updateOne(
        { providerId: payment.providerId },
        {
          $inc: {
            pending: -payment.providerAmount,
            totalEarned: -payment.providerAmount
          }
        },
        { session }
      );

      await session.commitTransaction();

    } catch (error) {

      await session.abortTransaction();
      throw error;

    } finally {

      session.endSession();

    }
  }

}