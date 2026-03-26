import mongoose from "mongoose";

const CATEGORY_TYPES = ['electrical', 'plumbing', 'hvac', 'appliance', 'security', 'painting', 'other'] as const;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: CATEGORY_TYPES,
      default: 'other',
      trim: true,
    },

    description: {
      type: String,
      default: "",
    }, 

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);