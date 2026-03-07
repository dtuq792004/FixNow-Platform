import mongoose, { Schema } from "mongoose";

export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER_CONFIRM"
  | "COMPLETED"
  | "CANCELLED";

export type RequestType = "NORMAL" | "URGENT" | "RECURRING";

const requestSchema = new mongoose.Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    requestType: {
      type: String,
      enum: ["NORMAL", "URGENT", "RECURRING"],
      default: "NORMAL",
    },
    
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "IN_PROGRESS",
        "WAITING_CUSTOMER_CONFIRM",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    completionMedia: [
      {
        type: String,
      },
    ],

    completionNote: {
      type: String,
    },

    startAt: Date,
    providerCompletedAt: Date,
    customerConfirmedAt: Date,

  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);