import mongoose, { Schema } from "mongoose";

export type RequestStatus =
  | "AWAITING_PAYMENT" // Đang chờ thanh toán trước khi hiện lên chợ việc
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RequestType = "NORMAL" | "URGENT" | "RECURRING";

export interface IRequest extends Document {
  customerId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  requestType: RequestType;

  // Pricing fields cho tính minh bạch và tin cậy
  price: number; // Đây là giá cơ sở (originalPrice)
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  promoCode?: string;

  description?: string;
  media?: string[];
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
    originalPrice: {
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
    promoCode: {
      type: String,
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
        "AWAITING_PAYMENT",
        "PENDING",
        "ACCEPTED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "AWAITING_PAYMENT",
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