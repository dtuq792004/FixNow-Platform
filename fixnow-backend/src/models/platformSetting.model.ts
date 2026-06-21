import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformSetting extends Document {

  platformFeePercent: number;

  minWithdrawAmount: number;

  terms: string;

  updatedBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const platformSettingSchema = new Schema<IPlatformSetting>(
  {
    platformFeePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20
    },

    minWithdrawAmount: {
      type: Number,
      default: 100000
    },

    terms: {
      type: String,
      default: "FixNow kết nối khách hàng với Provider và bảo vệ thanh toán trong suốt quá trình cung cấp dịch vụ."
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const PlatformSetting = mongoose.model<IPlatformSetting>(
  "PlatformSetting",
  platformSettingSchema
);
