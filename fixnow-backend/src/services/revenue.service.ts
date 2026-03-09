import { Payment } from "../models/payment.model";
import mongoose from "mongoose";

export const getRevenueByProvider = async (
  providerId: string,
  range: "day" | "month" | "year"
) => {
  const groupFormat: any = {
    day: {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
      day: { $dayOfMonth: "$createdAt" }
    },
    month: {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" }
    },
    year: {
      year: { $year: "$createdAt" }
    }
  };

  const revenue = await Payment.aggregate([
    {
      $match: {
        providerId: new mongoose.Types.ObjectId(providerId),
        status: "SUCCESS"
      }
    },
    {
      $group: {
        _id: groupFormat[range],
        totalRevenue: { $sum: "$providerAmount" },
        totalOrders: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": -1 }
    }
  ]);

  return revenue;
};