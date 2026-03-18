import mongoose, { Schema, Document } from "mongoose";

export type ServiceStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ServiceUnit = "hour" | "job";

export interface IService extends Document {
  providerId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  unit: ServiceUnit;
  status: ServiceStatus;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
{
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  price: {
    type: Number,
    required: true
  },

  unit: {
    type: String,
    enum: ["hour", "job"],
    default: "job"
  },

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },

  image: [String]

},
{ timestamps: true }
);

const Service = mongoose.model<IService>("Service", serviceSchema);
export default Service;