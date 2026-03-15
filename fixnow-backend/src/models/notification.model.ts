import mongoose, { Schema, Document, Types } from "mongoose";

export enum NotificationType {
  SYSTEM = "SYSTEM",
  TICKET_CREATED = "TICKET_CREATED",
  TICKET_RESOLVED = "TICKET_RESOLVED",
  WARRANTY_REQUESTED = "WARRANTY_REQUESTED"
}

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  entityId?: Types.ObjectId;
  entityType?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },

    entityId: {
      type: Schema.Types.ObjectId
    },

    entityType: {
      type: String
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);