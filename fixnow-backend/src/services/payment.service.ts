import mongoose from "mongoose";
import { payos } from "../configs/payos.config";
import { Payment } from "../models/payment.model";
import { ProviderWallet } from "../models/wallet.model";
import { calculatePayment } from "../utils/calculate.util";

export class PaymentService {
  static async createPayment(sr: any, promoCode?: string) {
    const calculation = await calculatePayment(sr.price, promoCode);

    const orderCode = Date.now(); // đủ unique cho hệ thống service platform

    // 3️⃣ Tạo Payment record trong DB
    const payment = await Payment.create({
      serviceRequestId: sr._id,
      customerId: sr.customerId,
      providerId: sr.providerId,
      orderCode,
      ...calculation,
      status: "PENDING",
    });

    const response = await payos.paymentRequests.create({
      orderCode: orderCode,
      amount: calculation.finalAmount,
      description: `Thanh toán dịch vụ ${sr._id}`,
      returnUrl: process.env.PAYOS_RETURN_URL!,
      cancelUrl: process.env.PAYOS_CANCEL_URL!,
    });

    return response.checkoutUrl;
  }

  static async handleWebhook(rawBody: any) {
    const webhookData = await payos.webhooks.verify(rawBody);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2️⃣ Tìm payment theo orderCod
      const payment = await Payment.findOne({
        orderCode: webhookData.orderCode,
      }).session(session);

      if (!payment) throw new Error("Payment not found");

      if (payment.status === "SUCCESS") {
        await session.commitTransaction();
        return;
      }

      // 4️⃣ Nếu thanh toán thành công
      if (webhookData.code === "00") {
        payment.status = "SUCCESS";
        payment.transactionRef = webhookData.reference;

        await payment.save({ session });

        // 5️⃣ Cộng tiền vào ví provider (pending)
        await ProviderWallet.updateOne(
          { providerId: payment.providerId },
          {
            $inc: {
              pending: payment.providerAmount,
            },
          },
          {
            upsert: true,
            session,
          },
        );
      } else {
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

  static async refund(paymentId: string) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) throw new Error("Payment not found");

      if (payment.status !== "SUCCESS") {
        throw new Error("Only successful payments can be refunded");
      }

      await payos.paymentRequests.cancel(payment.orderCode);

      payment.status = "REFUNDED";
      await payment.save({ session });

      await ProviderWallet.updateOne(
        { providerId: payment.providerId },
        { $inc: { pending: -payment.providerAmount } },
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
