import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  code: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  usageLimit: number | null;
  usedCount: number;
  expiredAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["PERCENT", "AMOUNT"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    usageLimit: {
      type: Number,
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    expiredAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Index tối ưu tìm kiếm
promotionSchema.index({ code: 1, isActive: 1 });

export const Promotion = mongoose.model<IPromotion>(
  "Promotion",
  promotionSchema,
);
