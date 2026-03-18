import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  requestId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;

  orderCode: number;

  originalAmount: number;
  discountCode?: string;
  discountAmount: number;

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
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "Request", 
      required: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    orderCode: {
      type: Number,
      required: true,
      unique: true,
    },

    originalAmount: {
      type: Number,
      required: true,
    },

    discountCode: {
      type: String,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      required: true,
    },

    platformFee: {
      type: Number,
      required: true,
    },

    providerAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    transactionRef: String,
  },
  {
    timestamps: true,
  }
);

// Index tối ưu analytics
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ providerId: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);