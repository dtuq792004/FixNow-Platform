import mongoose, { Schema, Document } from "mongoose";

/**
 * Sự kiện web analytics first-party (thay Vercel Analytics). Ẩn danh, không cookie:
 * visitorHash = hash(ip + user-agent + ngày + salt) → đổi theo ngày, không định danh người thật.
 * hostname được suy ra ở server (từ Origin/Host, có allowlist) — KHÔNG tin giá trị client gửi.
 * TTL 400 ngày để dữ liệu không phình vô hạn (dùng chung DB với dữ liệu nghiệp vụ).
 */
export interface IWebAnalyticsEvent extends Document {
  type: string; // "pageview" | tên custom event
  path: string; // pathname (không kèm query để tránh lộ PII)
  referrerDomain: string; // domain giới thiệu hoặc "direct"
  hostname: string; // tên miền (server-derived) hoặc "unknown"
  country: string; // mã ISO (VD "VN") hoặc "Unknown"
  device: string; // "desktop" | "mobile" | "tablet"
  os: string;
  browser: string;
  sessionId: string; // do client sinh (sessionStorage, 30 phút) — tính bounce rate
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  visitorHash: string;
  timestamp: Date;
}

const TTL_DAYS = 400;

const schema = new Schema<IWebAnalyticsEvent>(
  {
    type: { type: String, required: true, default: "pageview" },
    path: { type: String, required: true },
    referrerDomain: { type: String, default: "direct" },
    hostname: { type: String, default: "unknown" },
    country: { type: String, default: "Unknown" },
    device: { type: String, default: "desktop" },
    os: { type: String, default: "Unknown" },
    browser: { type: String, default: "Unknown" },
    sessionId: { type: String, default: "" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
    visitorHash: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

// Index chính cho mọi aggregation ($match type + timestamp).
schema.index({ type: 1, timestamp: -1 });
// TTL trên timestamp (cũng phục vụ truy vấn theo thời gian) — tự xoá event > 400 ngày.
schema.index({ timestamp: 1 }, { expireAfterSeconds: TTL_DAYS * 86400 });

export const WebAnalyticsEvent = mongoose.model<IWebAnalyticsEvent>(
  "WebAnalyticsEvent",
  schema,
  "web_analytics_events",
);
