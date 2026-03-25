import { Schema, model, Document, Types } from "mongoose";

export enum ProviderRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IProviderRequest extends Document {
  userId: Types.ObjectId;
  fullName: string;
  phone: string;
  experience: string;
  specialties: string[];
  serviceArea: string;
  idCard: string;
  motivation?: string;
  status: ProviderRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const providerRequestSchema = new Schema<IProviderRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    specialties: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    serviceArea: {
      type: String,
      required: true,
    },
    idCard: {
      type: String,
      required: true,
    },
    motivation: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(ProviderRequestStatus),
      default: ProviderRequestStatus.PENDING,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ProviderRequest = model<IProviderRequest>(
  "ProviderRequest",
  providerRequestSchema
);