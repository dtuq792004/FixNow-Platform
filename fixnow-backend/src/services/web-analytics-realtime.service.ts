import { WebAnalyticsEvent } from "../models/web-analytics-event.model";

const TZ = "+07:00";
const OPTS = { allowDiskUse: true };

/** Realtime trong MỘT $facet: online (5 phút), pageviews 30 phút, theo phút, top pages. */
export const getRealtime = async () => {
  const now = Date.now();
  const from30 = new Date(now - 30 * 60 * 1000);
  const from5 = new Date(now - 5 * 60 * 1000);

  const [row] = await WebAnalyticsEvent.aggregate(
    [
      { $match: { timestamp: { $gte: from30 } } },
      {
        $facet: {
          online5m: [
            { $match: { type: "pageview", timestamp: { $gte: from5 } } },
            { $group: { _id: null, v: { $addToSet: "$visitorHash" } } },
            { $project: { _id: 0, count: { $size: "$v" } } },
          ],
          pv30m: [{ $match: { type: "pageview" } }, { $count: "count" }],
          perMinute: [
            { $match: { type: "pageview" } },
            {
              // key có ngày để $sort đúng khi cửa sổ 30' vắt qua nửa đêm.
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$timestamp", timezone: TZ } },
                value: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          topPages: [
            { $match: { type: "pageview" } },
            { $group: { _id: "$path", value: { $sum: 1 } } },
            { $project: { key: "$_id", value: 1, _id: 0 } },
            { $sort: { value: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ],
    OPTS,
  );

  return {
    online: row?.online5m?.[0]?.count || 0,
    pageviews30m: row?.pv30m?.[0]?.count || 0,
    perMinute: (row?.perMinute || []).map((r: any) => ({ minute: String(r._id).slice(11), value: r.value })),
    topPages: row?.topPages || [],
  };
};
