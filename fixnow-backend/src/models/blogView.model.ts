import mongoose, { Schema } from "mongoose";

const blogViewSchema = new Schema(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

blogViewSchema.index({ blogId: 1, date: 1 }, { unique: true });
blogViewSchema.index({ date: 1 });

export const BlogView = mongoose.model("BlogView", blogViewSchema);
