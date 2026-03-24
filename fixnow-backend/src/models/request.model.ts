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

  // ── Service selection ─────────────────────────────────────────────────────
  categoryId?: mongoose.Types.ObjectId; // category selected by customer
  services: mongoose.Types.ObjectId[];  // specific Service documents (optional)

  // ── Address ───────────────────────────────────────────────────────────────
  addressId?: mongoose.Types.ObjectId;  // saved Address ref (optional)
  addressText?: string;                 // plain-text fallback

  // ── Request info ──────────────────────────────────────────────────────────
  title?: string;
  description?: string;
  note?: string;
  media?: string[];
  requestType: RequestType;

  // ── Pricing ───────────────────────────────────────────────────────────────
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  promoCode?: string;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  status: RequestStatus;
  startAt: Date;
  providerCompletedAt?: Date;
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

    // ── Service selection ───────────────────────────────────────────────────
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    // ── Address ─────────────────────────────────────────────────────────────
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },

    addressText: {
      type: String,
    },

    // ── Request info ─────────────────────────────────────────────────────────
    title: {
      type: String,
    },

    description: {
      type: String,
    },

    note: {
      type: String,
    },

    media: [String],

    requestType: {
      type: String,
      enum: ["NORMAL", "URGENT", "RECURRING"],
      default: "NORMAL",
    },

    // ── Pricing ──────────────────────────────────────────────────────────────
    totalPrice: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      default: 0,
    },

    promoCode: String,

    // ── Lifecycle ─────────────────────────────────────────────────────────────
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
      default: "PENDING",
    },

    startAt: {
      type: Date,
      default: Date.now,
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
