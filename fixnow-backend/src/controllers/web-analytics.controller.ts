import { Request, Response } from "express";
import { collectEvent, resolveHostname, isBot } from "../services/web-analytics-collect.service";
import { isRateLimited } from "../utils/analytics-rate-limit";
import { getSummaryWithChange, getTimeseries } from "../services/web-analytics-report.service";
import { getBreakdown, isValidDimension, clampLimit, parseBreakdownMetric } from "../services/web-analytics-breakdown.service";
import { getRealtime } from "../services/web-analytics-realtime.service";

// ── Public: nhận beacon từ tracker ở web (không cần auth) ─────────────────────
// Luôn trả 204 và insert theo kiểu fire-and-forget để không làm chậm / hỏng UX web.
export const collectController = (req: Request, res: Response) => {
  const ip = req.ip || "";
  const userAgent = (req.headers["user-agent"] as string) || "";
  const origin = (req.headers["origin"] as string) || "";
  const host = (req.headers["host"] as string) || "";

  // Trả 204 ngay, không chờ ghi DB.
  res.status(204).end();

  // Lọc rẻ trước khi ghi: Origin lạ, bot, hoặc vượt rate-limit → bỏ qua.
  // Ở production, beacon trình duyệt hợp lệ luôn kèm Origin → thiếu Origin = script giả mạo.
  if (process.env.NODE_ENV === "production" && !origin) return;
  if (origin && resolveHostname(origin, "") === "unknown") return;
  if (isBot(userAgent)) return;
  if (isRateLimited(ip)) return;

  const { path, referrer, type, sessionId, utmSource, utmMedium, utmCampaign } = req.body || {};
  collectEvent({
    path,
    referrer,
    type,
    sessionId,
    utmSource,
    utmMedium,
    utmCampaign,
    ip,
    userAgent,
    origin,
    host,
  }).catch((err) => console.error("[analytics] insert failed", err));
};

// Chỉ cho phép 3 mốc khoảng ngày cố định. `from` được làm tròn về 00:00 giờ VN
// của ngày sớm nhất → đúng N bucket ngày trọn vẹn (ngày đầu không bị cắt dở).
const DAY_MS = 86400000;
const VN_SHIFT = 7 * 3600 * 1000;
const rangeFromDays = (raw: unknown) => {
  const n = Number(raw);
  const days = [7, 30, 90].includes(n) ? n : 7;
  const vnMidnightUtc = Math.floor((Date.now() + VN_SHIFT) / DAY_MS) * DAY_MS - VN_SHIFT;
  const from = new Date(vnMidnightUtc - (days - 1) * DAY_MS);
  return { from, to: new Date(), days };
};

// Các chiều hiển thị trên overview (top 8 mỗi chiều).
const OVERVIEW_DIMS = ["page", "hostname", "referrer", "utmSource", "country", "device", "browser", "os"] as const;

// ── Admin: toàn bộ số liệu traffic cho 1 khoảng ngày ─────────────────────────
export const getWebOverviewController = async (req: Request, res: Response) => {
  try {
    const { from, to, days } = rangeFromDays(req.query.days);
    const metric = parseBreakdownMetric(req.query.metric);
    const [summary, timeseries, ...breakdowns] = await Promise.all([
      getSummaryWithChange(from, to),
      getTimeseries(from, to),
      ...OVERVIEW_DIMS.map((d) => getBreakdown(from, to, d, 8, metric).then((r) => r.items)),
    ]);
    const [pages, hostnames, referrers, utmSources, countries, devices, browsers, os] = breakdowns;
    res.json({
      data: { days, summary, timeseries, pages, hostnames, referrers, utmSources, countries, devices, browsers, os },
    });
  } catch (error) {
    res.status(500).json({ message: "Không tải được web analytics", error: String(error) });
  }
};

export const getWebBreakdownController = async (req: Request, res: Response) => {
  try {
    const dimension = String(req.query.dimension || "");
    if (!isValidDimension(dimension)) {
      return res.status(400).json({ message: "Chiều dữ liệu không hợp lệ" });
    }
    const { from, to } = rangeFromDays(req.query.days);
    const metric = parseBreakdownMetric(req.query.metric);
    const limit = clampLimit(req.query.limit);
    const data = await getBreakdown(from, to, dimension, limit, metric);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: "Không tải được breakdown", error: String(error) });
  }
};

export const getWebRealtimeController = async (_req: Request, res: Response) => {
  try {
    res.json({ data: await getRealtime() });
  } catch (error) {
    res.status(500).json({ message: "Không tải được realtime", error: String(error) });
  }
};
