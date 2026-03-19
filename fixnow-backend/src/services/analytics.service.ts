import { Payment } from "../models/payment.model";
import User from "../models/user.model";
import RequestModel from "../models/request.model";
import { WithdrawRequest } from "../models/withdrawRequest.model";

export const getDashboardSummaryService = async () => {

  const totalUsers = await User.countDocuments();

  const totalOrders = await RequestModel.countDocuments();

  const revenueData = await Payment.aggregate([
    {
      $match: { status: "SUCCESS" }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        platformFee: { $sum: "$platformFee" }
      }
    }
  ]);

  return {
    totalUsers,
    totalOrders,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    platformFee: revenueData[0]?.platformFee || 0
  };
};

export const getRevenueAnalyticsService = async (range: string) => {

  const groupFormat: any = {
    day: {
      $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
    },
    month: {
      $dateToString: { format: "%Y-%m", date: "$createdAt" }
    },
    year: {
      $dateToString: { format: "%Y", date: "$createdAt" }
    }
  };

  return Payment.aggregate([
    {
      $match: { status: "SUCCESS" }
    },
    {
      $group: {
        _id: groupFormat[range] || groupFormat.month,
        revenue: { $sum: "$amount" },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export const getOrderAnalyticsService = async () => {

  return RequestModel.aggregate([
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 }
      }
    }
  ]);
};

export const getTopProvidersService = async () => {

  return Payment.aggregate([
    {
      $match: { status: "SUCCESS" }
    },
    {
      $group: {
        _id: "$providerId",
        revenue: { $sum: "$providerAmount" },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { revenue: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

export const getUserGrowthService = async () => {

  return User.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt"
          }
        },
        totalUsers: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export const getWithdrawAnalyticsService = async () => {

  return WithdrawRequest.aggregate([
    {
      $group: {
        _id: "$status",
        totalAmount: { $sum: "$amount" },
        totalRequests: { $sum: 1 }
      }
    }
  ]);
};