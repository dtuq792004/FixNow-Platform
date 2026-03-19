import { Payment } from "../models/payment.model";
import { Wallet } from "../models/wallet.model";

export async function settlePayment(payment: any) {

  await Wallet.updateOne(
    { userId: payment.providerId },
    {
      $inc: {
        pending: -payment.providerAmount,
        balance: payment.providerAmount
      }
    }
  );
}