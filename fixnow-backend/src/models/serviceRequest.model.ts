import mongoose from "mongoose";

const schema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  providerId: mongoose.Schema.Types.ObjectId,
  price: Number,
  status: {
    type: String,
    enum: [
      "PENDING",
      "ACCEPTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
    ],
    default: "PENDING"
  },
  completedAt: Date,
  customerConfirmedAt: Date
}, { timestamps: true });

export const ServiceRequest =
  mongoose.model("ServiceRequest", schema);