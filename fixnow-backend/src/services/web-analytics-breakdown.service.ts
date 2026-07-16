import { WebAnalyticsEvent } from "../models/web-analytics-event.model";

const OPTS = { allowDiskUse: true };

// Whitelist chiều breakdown (chống injection tên field). routePattern đã bị cắt.
export const DIMENSION_FIELD: Record<string, string> = {
  page: "path",
  hostname: "hostname",
  referrer: "referrerDomain",
  utmSource: "utmSource",
  country: "country",
  device: "device",
  browser: "browser",
  os: "os",
};

export const isValidDimension = (dim: string) => Boolean(DIMENSION_FIELD[dim]);
export type BreakdownMetric = "visitors" | "pageviews";
export const parseBreakdownMetric = (raw: unknown): BreakdownMetric =>
  raw === "visitors" ? "visitors" : "pageviews";


export const clampLimit = (raw: unknown, fallback = 100) => {
  const n = parseInt(String(raw), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(500, Math.max(1, n));
};

/**
 * Breakdown sắp xếp theo metric đang chọn; response luôn giữ cả visitors và pageviews.
 * Trả { items, total } để hỗ trợ "Xem tất cả". Bỏ key rỗng (dữ liệu thiếu, VD utm trống).
 */
export const getBreakdown = async (
  from: Date,
  to: Date,
  dimension: string,
  limit: number,
  metric: BreakdownMetric = "pageviews",
) => {
  const field = DIMENSION_FIELD[dimension];
  if (!field) throw new Error("Chiều dữ liệu không hợp lệ");
  const sort = metric === "visitors"
    ? { visitors: -1 as const, pageviews: -1 as const }
    : { pageviews: -1 as const, visitors: -1 as const };

  const [row] = await WebAnalyticsEvent.aggregate(
    [
      { $match: { type: "pageview", timestamp: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: `$${field}`,
          visitors: { $addToSet: "$visitorHash" },
          pageviews: { $sum: 1 },
        },
      },
      { $project: { key: { $ifNull: ["$_id", "Unknown"] }, visitors: { $size: "$visitors" }, pageviews: 1 } },
      { $match: { key: { $ne: "" } } },
      {
        $facet: {
          items: [{ $sort: sort }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ],
    OPTS,
  );

  return {
    items: (row?.items || []).map((r: any) => ({ key: r.key, visitors: r.visitors, pageviews: r.pageviews })),
    total: row?.total?.[0]?.count || 0,
  };
};
