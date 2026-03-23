import { Payment } from "../models/payment.model";
import User from "../models/user.model";
import RequestModel from "../models/request.model";
import { WithdrawRequest } from "../models/withdrawRequest.model";

export const getDashboardSummaryService = async () => {
  const [totalUsers, totalProviders, totalRequests] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "PROVIDER" }),
    RequestModel.countDocuments(),
  ]);

  const revenueData = await Payment.aggregate([
    {
      $match: { status: "SUCCESS" },
    },
    {
      $group: {
        _id: null,
        totalGrossRevenue: { $sum: "$amount" },
        totalNetRevenue: { $sum: "$platformFee" },
      },
    },
  ]);

  return {
    totalUsers,
    totalProviders,
    totalRequests,
    totalGrossRevenue: revenueData[0]?.totalGrossRevenue || 0,
    totalNetRevenue: revenueData[0]?.totalNetRevenue || 0,
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
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "providerInfo"
      }
    },
    {
      $unwind: "$providerInfo"
    },
    {
      $project: {
        _id: 1,
        revenue: 1,
        orders: 1,
        name: "$providerInfo.fullName",
        avatar: "$providerInfo.avatar",
        email: "$providerInfo.email",
        phone: "$providerInfo.phone"
      }
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