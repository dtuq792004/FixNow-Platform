import { Payment } from "../models/payment.model";
import mongoose from "mongoose";

export type RevenueRange = "day" | "month" | "year";

type RevenueGroupId = {
  year: number;
  month?: number;
  day?: number;
};

type AggregatedRevenue = {
  _id: RevenueGroupId;
  totalRevenue: number;
  totalOrders: number;
};

const REPORT_TIMEZONE = "Asia/Ho_Chi_Minh";

export const getRevenueByProvider = async (
  providerId: string,
  range: RevenueRange
) => {
  const now = new Date();
  const startDate = getStartDate(now, range);
  const groupFormat: Record<RevenueRange, Record<string, unknown>> = {
    day: {
      year: { $year: { date: "$createdAt", timezone: REPORT_TIMEZONE } },
      month: { $month: { date: "$createdAt", timezone: REPORT_TIMEZONE } },
      day: { $dayOfMonth: { date: "$createdAt", timezone: REPORT_TIMEZONE } }
    },
    month: {
      year: { $year: { date: "$createdAt", timezone: REPORT_TIMEZONE } },
      month: { $month: { date: "$createdAt", timezone: REPORT_TIMEZONE } }
    },
    year: {
      year: { $year: { date: "$createdAt", timezone: REPORT_TIMEZONE } }
    }
  };

  const revenue = await Payment.aggregate<AggregatedRevenue>([
    {
      $match: {
        providerId: new mongoose.Types.ObjectId(providerId),
        status: "SUCCESS",
        createdAt: { $gte: startDate, $lte: now }
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
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
    }
  ]);

  return fillRevenuePeriods(revenue, now, range);
};

const getStartDate = (now: Date, range: RevenueRange) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === "day") {
    start.setDate(start.getDate() - 6);
  } else if (range === "month") {
    start.setDate(1);
    start.setMonth(start.getMonth() - 11);
  } else {
    start.setMonth(0, 1);
    start.setFullYear(start.getFullYear() - 4);
  }

  return start;
};

const fillRevenuePeriods = (
  revenue: AggregatedRevenue[],
  now: Date,
  range: RevenueRange,
) => {
  const revenueMap = new Map(
    revenue.map((point) => [toPeriodKey(point._id, range), point]),
  );
  const periodCount = range === "day" ? 7 : range === "month" ? 12 : 5;

  return Array.from({ length: periodCount }, (_, index) => {
    const date = new Date(now);

    if (range === "day") {
      date.setDate(date.getDate() - (periodCount - 1 - index));
    } else if (range === "month") {
      date.setDate(1);
      date.setMonth(date.getMonth() - (periodCount - 1 - index));
    } else {
      date.setMonth(0, 1);
      date.setFullYear(date.getFullYear() - (periodCount - 1 - index));
    }

    const id: RevenueGroupId = {
      year: date.getFullYear(),
      ...(range !== "year" ? { month: date.getMonth() + 1 } : {}),
      ...(range === "day" ? { day: date.getDate() } : {}),
    };
    const point = revenueMap.get(toPeriodKey(id, range));

    return {
      _id: id,
      periodStart: date.toISOString(),
      label: formatPeriodLabel(date, range),
      totalRevenue: point?.totalRevenue ?? 0,
      totalOrders: point?.totalOrders ?? 0,
    };
  });
};

const toPeriodKey = (id: RevenueGroupId, range: RevenueRange) => {
  if (range === "year") return String(id.year);
  if (range === "month") return `${id.year}-${id.month}`;
  return `${id.year}-${id.month}-${id.day}`;
};

const formatPeriodLabel = (date: Date, range: RevenueRange) => {
  if (range === "day") {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  }
  if (range === "month") return `T${date.getMonth() + 1}/${date.getFullYear()}`;
  return String(date.getFullYear());
};
