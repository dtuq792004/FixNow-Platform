import mongoose, { Document, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IServiceFeedback extends Document {
  serviceId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}

export interface IRequestFeedback extends Document {
  requestId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  providerReply?: string;
  status: "VISIBLE" | "HIDDEN";
  servicesFeedbacks: IServiceFeedback[];
  createdAt?: Date;
}

const ServiceFeedbackSchema = new mongoose.Schema<IServiceFeedback>({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true
  }
});

const RequestFeedbackSchema = new mongoose.Schema<IRequestFeedback>(
{
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true,
    unique: true
  },

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true
  },

  providerReply: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ["VISIBLE", "HIDDEN"],
    default: "VISIBLE"
  },

  servicesFeedbacks: [ServiceFeedbackSchema]

},
{
  timestamps: { createdAt: true, updatedAt: false }
}
);

RequestFeedbackSchema.plugin(mongoosePaginate);

const FeedbackModel = mongoose.model<
  IRequestFeedback,
  PaginateModel<IRequestFeedback>
>(
  "Feedback",
  RequestFeedbackSchema,
  "feedbacks"
);

export default FeedbackModel;