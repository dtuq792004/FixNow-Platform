import { WebAnalyticsEvent } from "../models/web-analytics-event.model";

const TZ = "+07:00";
const DAY = 86400000;
const OPTS = { allowDiskUse: true };

const ymdVN = (d: Date) => new Date(d.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
const round1 = (n: number) => Math.round(n * 10) / 10;

// change = % thay đổi so kỳ trước; prev=0 → null (UI hiển thị "Mới").
const pctChange = (cur: number, prev: number): number | null =>
  prev > 0 ? round1(((cur - prev) / prev) * 100) : null;

type Totals = { visitors: number; pageviews: number; bounceRate: number };

// visitors = khách duy nhất trong số PAGEVIEW (đồng nhất với timeseries + breakdown).
const totalsGroup = [
  {
    $group: {
      _id: null,
      pageviews: { $sum: { $cond: [{ $eq: ["$type", "pageview"] }, 1, 0] } },
      visitors: { $addToSet: { $cond: [{ $eq: ["$type", "pageview"] }, "$visitorHash", "$$REMOVE"] } },
    },
  },
  { $project: { _id: 0, pageviews: 1, visitors: { $size: "$visitors" } } },
];

const sessionsGroup = [
  { $match: { type: "pageview", sessionId: { $ne: "" } } },
  { $group: { _id: "$sessionId", pv: { $sum: 1 } } },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      bounced: { $sum: { $cond: [{ $eq: ["$pv", 1] }, 1, 0] } },
    },
  },
];

const readTotals = (totalsArr: any[], sessArr: any[]): Totals => {
  const t = totalsArr[0] || { pageviews: 0, visitors: 0 };
  const s = sessArr[0] || { total: 0, bounced: 0 };
  return {
    visitors: t.visitors || 0,
    pageviews: t.pageviews || 0,
    bounceRate: s.total ? round1((s.bounced / s.total) * 100) : 0,
  };
};

/** Tổng quan + %change trong MỘT $facet (kỳ hiện tại + kỳ liền trước). */
export const getSummaryWithChange = async (from: Date, to: Date) => {
  const len = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - len);
  const cur = { $gte: from, $lte: to };
  const prev = { $gte: prevFrom, $lt: from };

  const [row] = await WebAnalyticsEvent.aggregate(
    [
      { $match: { timestamp: { $gte: prevFrom, $lte: to } } },
      {
        $facet: {
          curTotals: [{ $match: { timestamp: cur } }, ...totalsGroup],
          prevTotals: [{ $match: { timestamp: prev } }, ...totalsGroup],
          curSessions: [{ $match: { timestamp: cur } }, ...sessionsGroup],
          prevSessions: [{ $match: { timestamp: prev } }, ...sessionsGroup],
        },
      },
    ],
    OPTS,
  );

  const current = readTotals(row?.curTotals || [], row?.curSessions || []);
  const previous = readTotals(row?.prevTotals || [], row?.prevSessions || []);
  return {
    ...current,
    prev: previous,
    change: {
      visitors: pctChange(current.visitors, previous.visitors),
      pageviews: pctChange(current.pageviews, previous.pageviews),
      bounceRate: pctChange(current.bounceRate, previous.bounceRate),
    },
  };
};

/** Chuỗi ngày (zero-fill): visitors, pageviews, bounceRate mỗi ngày. */
export const getTimeseries = async (from: Date, to: Date) => {
  const [row] = await WebAnalyticsEvent.aggregate(
    [
      { $match: { type: "pageview", timestamp: { $gte: from, $lte: to } } },
      {
        $facet: {
          daily: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: TZ } },
                pageviews: { $sum: 1 },
                visitors: { $addToSet: "$visitorHash" },
              },
            },
            { $project: { pageviews: 1, visitors: { $size: "$visitors" } } },
          ],
          sessions: [
            { $match: { sessionId: { $ne: "" } } },
            {
              $group: {
                _id: {
                  day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: TZ } },
                  sid: "$sessionId",
                },
                pv: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: "$_id.day",
                total: { $sum: 1 },
                bounced: { $sum: { $cond: [{ $eq: ["$pv", 1] }, 1, 0] } },
              },
            },
          ],
        },
      },
    ],
    OPTS,
  );

  const daily = new Map<string, any>((row?.daily || []).map((r: any) => [r._id, r]));
  const sess = new Map<string, any>((row?.sessions || []).map((r: any) => [r._id, r]));
  const series = [];
  for (let t = from.getTime(); t <= to.getTime(); t += DAY) {
    const key = ymdVN(new Date(t));
    const d = daily.get(key);
    const s = sess.get(key);
    series.push({
      date: key,
      pageviews: d?.pageviews || 0,
      visitors: d?.visitors || 0,
      bounceRate: s?.total ? round1((s.bounced / s.total) * 100) : 0,
    });
  }
  return series;
};
