import mongoose, { Schema, Document, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export enum ComplaintStatus {
  OPEN = "OPEN",
  PROCESSING = "PROCESSING",
  RESOLVED = "RESOLVED"
}

export interface IComplaint extends Document {
  requestId: Types.ObjectId;
  customerId: Types.ObjectId;
  providerId: Types.ObjectId;
  content: string;
  warrantyRequested: boolean;
  status: ComplaintStatus;
  handledBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "Request",
      required: true
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    warrantyRequested: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.OPEN
    },

    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.plugin(mongoosePaginate);

export interface ComplaintModel<T extends Document>
  extends mongoose.PaginateModel<T> {}

export const Complaint = mongoose.model<IComplaint, ComplaintModel<IComplaint>>(
  "Complaint",
  complaintSchema,
  "complaints"
);