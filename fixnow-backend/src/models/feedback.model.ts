import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { PaginateModel } from "mongoose";

const ServiceFeedbackSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true
  },
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

const RequestFeedbackSchema = new mongoose.Schema(
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

const FeedbackModel = mongoose.model<any, PaginateModel<any>>(
  "Feedback",
  RequestFeedbackSchema,
  "feedbacks"
);

export default FeedbackModel;