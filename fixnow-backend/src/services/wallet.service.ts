import { Wallet } from "../models/wallet.model";

export const getWalletByProvider = async (providerId: string) => {
  let wallet = await Wallet.findOne({ providerId });

  if (!wallet) {
    wallet = await Wallet.create({
      providerId
    });
  }

  return wallet;
};