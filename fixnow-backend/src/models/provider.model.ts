import { Schema, model, Document, Types } from "mongoose";

export enum ProviderActiveStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export interface IProvider extends Document {
  userId: Types.ObjectId;
  description: string;
  experienceYears: number;
  activeStatus: ProviderActiveStatus;
  verified: boolean;
  serviceCategories: Types.ObjectId[];
  workingAreas: string[];
  operatingRadiusKm: number;
  workingSchedule: {
    weekdays: { enabled: boolean; start: string; end: string };
    saturday: { enabled: boolean; start: string; end: string };
    sunday: { enabled: boolean; start: string; end: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema<IProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    activeStatus: {
      type: String,
      enum: Object.values(ProviderActiveStatus),
      default: ProviderActiveStatus.OFFLINE,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    serviceCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    workingAreas: [
      {
        type: String,
      },
    ],
    operatingRadiusKm: {
      type: Number,
      min: 1,
      max: 50,
      default: 15,
    },
    workingSchedule: {
      weekdays: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "18:00" },
      },
      saturday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "16:00" },
      },
      sunday: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "16:00" },
      },
    },
  },
  {
    timestamps: true,
  }
);

providerSchema.index({ serviceCategories: 1 });

export const Provider = model<IProvider>("Provider", providerSchema);
