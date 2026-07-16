import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import { WebAnalyticsEvent } from "../models/web-analytics-event.model";

/**
 * geoip-lite nặng (~100-150MB RAM khi load DB) → chỉ bật khi ANALYTICS_GEOIP="on"
 * và instance đủ RAM (≥1GB). Mặc định tắt → country = "Unknown".
 */
let geoip: { lookup: (ip: string) => { country?: string } | null } | null = null;
if (process.env.ANALYTICS_GEOIP === "on") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("geoip-lite");
    // Tắt watcher tự cập nhật DB (tiết kiệm tài nguyên).
    mod.stopWatchingDataUpdate?.();
    geoip = mod;
  } catch {
    geoip = null;
  }
}

// Salt cho visitorHash. Nếu chưa đặt ANALYTICS_SALT ở production: KHÔNG làm sập cả
// server (analytics là tính năng phụ) — dùng salt ngẫu nhiên theo mỗi lần boot (vẫn
// khó đoán; hash vốn đã đổi theo ngày) và cảnh báo để nên đặt env cho hash ổn định.
const SALT =
  process.env.ANALYTICS_SALT ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[analytics] ANALYTICS_SALT chưa đặt ở production — dùng salt ngẫu nhiên tạm thời. Nên đặt ANALYTICS_SALT để hash khách ổn định giữa các lần khởi động.",
      );
    }
    return crypto.randomBytes(32).toString("hex");
  })();

// Allowlist hostname hợp lệ (server tự suy ra từ Origin/Host — KHÔNG tin client gửi).
const HOST_ALLOWLIST = new Set([
  "localhost",
  "127.0.0.1",
  "fixnow-platform.vercel.app",
  "fix-now-platform.vercel.app",
]);
const isVercelPreviewHost = (h: string) => /^fix-?now-platform.*\.vercel\.app$/.test(h);

const BOT_RE =
  /(bot|crawl|spider|slurp|bingpreview|facebookexternalhit|preview|monitor|curl|wget|python-requests|axios|headless|lighthouse)/i;

const str = (v: unknown, cap: number) => String(v ?? "").slice(0, cap);

/** Ngày theo giờ VN (đổi salt theo ngày → visitorHash ẩn danh, đổi mỗi ngày). */
const vnDay = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

/** Domain giới thiệu: bỏ referrer nội bộ → "direct". */
const referrerDomain = (referrer: string, selfHost: string): string => {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || host === selfHost.replace(/^www\./, "")) return "direct";
    return host;
  } catch {
    return "direct";
  }
};

/** Suy ra hostname từ Origin (ưu tiên) hoặc Host header; chỉ chấp nhận nếu trong allowlist. */
export const resolveHostname = (origin: string, host: string): string => {
  let h = "";
  try {
    h = origin ? new URL(origin).hostname : (host || "").split(":")[0];
  } catch {
    h = (host || "").split(":")[0];
  }
  h = h.replace(/^www\./, "");
  if (HOST_ALLOWLIST.has(h) || isVercelPreviewHost(h)) return h;
  return "unknown";
};

export const isBot = (userAgent: string) => BOT_RE.test(userAgent || "");

type CollectInput = {
  path: string;
  referrer?: string;
  type?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ip: string;
  userAgent: string;
  origin?: string;
  host?: string;
};

export const collectEvent = async (input: CollectInput) => {
  const path = str(input.path, 300);
  if (!path) return; // bỏ event thiếu path (không ném lỗi ra client)

  const userAgent = input.userAgent || "";
  const ip = input.ip || "";
  const selfHost = resolveHostname(input.origin || "", input.host || "");

  const ua = new UAParser(userAgent).getResult();
  const country = (geoip && ip && geoip.lookup(ip)?.country) || "Unknown";
  const visitorHash = crypto
    .createHash("sha256")
    .update(`${ip}|${userAgent}|${vnDay()}|${SALT}`)
    .digest("hex")
    .slice(0, 32);

  await WebAnalyticsEvent.create({
    type: str(input.type || "pageview", 60),
    path,
    referrerDomain: referrerDomain(str(input.referrer, 500), selfHost),
    hostname: selfHost,
    country,
    device: ua.device.type || "desktop",
    os: ua.os.name || "Unknown",
    browser: ua.browser.name || "Unknown",
    sessionId: str(input.sessionId, 64),
    utmSource: str(input.utmSource, 100),
    utmMedium: str(input.utmMedium, 100),
    utmCampaign: str(input.utmCampaign, 100),
    visitorHash,
    timestamp: new Date(),
  });
};
