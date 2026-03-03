import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true
    },
    balance: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const ProviderWallet = mongoose.model(
  "ProviderWallet",
  walletSchema
);