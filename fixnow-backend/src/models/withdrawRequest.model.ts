import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawRequest extends Document {
  userId: mongoose.Types.ObjectId;

  amount: number;

  status: "PENDING" | "APPROVED" | "REJECTED";

  bankName: string;
  accountNumber: string;
  accountHolder: string;

  processedBy?: mongoose.Types.ObjectId;
  rejectReason?: string;

  processedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const withdrawRequestSchema = new Schema<IWithdrawRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    },

    bankName: {
      type: String,
      required: true
    },

    accountNumber: {
      type: String,
      required: true
    },

    accountHolder: {
      type: String,
      required: true
    },

    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    rejectReason: {
      type: String
    },

    processedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const WithdrawRequest = mongoose.model<IWithdrawRequest>(
  "WithdrawRequest",
  withdrawRequestSchema
);