import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBlogReview extends Document {
  blogId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogReviewSchema = new Schema<IBlogReview>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

blogReviewSchema.index({ blogId: 1, createdAt: -1 });

export const BlogReview = mongoose.model<IBlogReview>("BlogReview", blogReviewSchema);
