import mongoose from "mongoose";

const schema = new mongoose.Schema({
  platformFeePercent: {
    type: Number,
    required: true,
    default: 0.1 // 10%
  },
  updatedBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export const PlatformConfig =
  mongoose.model("PlatformConfig", schema);