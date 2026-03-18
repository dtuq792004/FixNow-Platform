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

export interface IRequest extends Document {
  customerId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  requestType: RequestType;
  price: number;
  description?: string;
  media: string[];
  status: RequestStatus;
  customerConfirmedAt?: Date;
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
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
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
    price: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    media: [
      {
        type: String,
      },
    ],
    
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

const Request =  mongoose.model<IRequest>("Request", requestSchema);
export default Request;