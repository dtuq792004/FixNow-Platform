import mongoose, { Schema, Document } from "mongoose";

export type RequestStatus =
  | "AWAITING_PAYMENT"
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RequestType = "NORMAL" | "URGENT" | "RECURRING";

export interface IRequest extends Document {
  customerId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;

  services: mongoose.Types.ObjectId[];

  addressId: mongoose.Types.ObjectId;
  requestType: RequestType;

  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  promoCode?: string;

  description?: string;
  media?: string[];

  status: RequestStatus;

  providerCompletedAt?: Date;
  startAt: Date;

  completionMedia?: string[];
  completionNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],

    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    requestType: {
      type: String,
      enum: ["NORMAL", "URGENT", "RECURRING"],
      default: "NORMAL",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      required: true,
    },

    promoCode: String,

    description: String,

    media: [String],

    status: {
      type: String,
      enum: [
        "AWAITING_PAYMENT",
        "PENDING",
        "ACCEPTED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "AWAITING_PAYMENT",
    },

    startAt: {
      type: Date,
      required: true,
    },

    providerCompletedAt: Date,

    completionMedia: [String],

    completionNote: String,
  },
  { timestamps: true },
);

const Request =
  mongoose.models.Request ||
  mongoose.model<IRequest>("Request", requestSchema, "requests");

export default Request;
