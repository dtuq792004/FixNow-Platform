import { Payment } from "../models/payment.model";
import { ProviderWallet } from "../models/providerWallet.model";

export async function settlePayment(payment: any) {

  await ProviderWallet.updateOne(
    { providerId: payment.providerId },
    {
      $inc: {
        pending: -payment.providerAmount,
        balance: payment.providerAmount
      }
    }
  );
}