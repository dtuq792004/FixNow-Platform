import cron from "node-cron";
import { ServiceRequest } from "../models/serviceRequest.model";
import { Payment } from "../models/payment.model";
import { ProviderWallet } from "../models/providerWallet.model";

cron.schedule("0 * * * *", async () => {

  const threshold = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  );

  const requests = await ServiceRequest.find({
    status: "COMPLETED",
    customerConfirmedAt: null,
    completedAt: { $lte: threshold }
  });

  for (const sr of requests) {

    const payment = await Payment.findOne({
      serviceRequestId: sr._id,
      status: "SUCCESS"
    });

    if (!payment) continue;

    await ProviderWallet.updateOne(
      { providerId: payment.providerId },
      {
        $inc: {
          pending: -payment.providerAmount,
          balance: payment.providerAmount
        }
      }
    );

    sr.customerConfirmedAt = new Date();
    await sr.save();
  }

});