import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  serviceRequestId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  orderCode: number;
  amount: number;
  platformFee: number;
  providerAmount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  transactionRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    serviceRequestId: { type: Schema.Types.ObjectId, required: true },
    customerId: { type: Schema.Types.ObjectId, required: true },
    providerId: { type: Schema.Types.ObjectId, required: true },

    orderCode: { type: Number, required: true, unique: true },

    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    providerAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING"
    },

    transactionRef: String
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);