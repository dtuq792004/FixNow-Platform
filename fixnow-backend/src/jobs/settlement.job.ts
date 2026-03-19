import cron from "node-cron";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { Wallet } from "../models/wallet.model";

cron.schedule("0 * * * *", async () => {

  const threshold = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  );

  const requests = await Request.find({
    status: "COMPLETED",
    customerConfirmedAt: null,
    completedAt: { $lte: threshold }
  });

  for (const request of requests) {

    const payment = await Payment.findOne({
      requestId: request._id,
      status: "SUCCESS"
    });

    if (!payment) continue;

    await Wallet.updateOne(
      { userId: payment.providerId },
      {
        $inc: {
          pending: -payment.providerAmount,
          balance: payment.providerAmount
        }
      }
    );

    request.customerConfirmedAt = new Date();
    await request.save();
  }

});