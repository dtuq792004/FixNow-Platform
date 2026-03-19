import { Wallet } from "../models/wallet.model";

export const getWalletByUser = async (userId: string) => {
  let wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    wallet = await Wallet.create({
      userId
    });
  }

  return wallet;
};