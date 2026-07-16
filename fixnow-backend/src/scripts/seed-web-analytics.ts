/**
 * Seed dữ liệu demo cho web analytics (web_analytics_events) + 1 tài khoản admin
 * để test dashboard. Chỉ tác động collection web_analytics_events và 1 user admin,
 * KHÔNG đụng dữ liệu nghiệp vụ khác.
 *
 * Chạy: MONGO_URI=... ts-node src/scripts/seed-web-analytics.ts
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { WebAnalyticsEvent } from "../models/web-analytics-event.model";
import User from "../models/user.model";

dotenv.config();

const rid = () => crypto.randomBytes(16).toString("hex");
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const weighted = <T>(pairs: Array<[T, number]>): T => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) <= 0) return v;
  }
  return pairs[0][0];
};

const PATHS: Array<[string, number]> = [
  ["/", 30], ["/services", 20], ["/pricing", 14], ["/blog", 12],
  ["/blog/sua-dieu-hoa-tai-nha", 8], ["/about", 8], ["/support", 8],
];
const REFERRERS: Array<[string, number]> = [
  ["direct", 40], ["google.com", 28], ["facebook.com", 16], ["zalo.me", 8], ["github.com", 8],
];
const HOSTS: Array<[string, number]> = [["fixnow-platform.vercel.app", 80], ["localhost", 20]];
const COUNTRIES: Array<[string, number]> = [
  ["VN", 62], ["US", 12], ["JP", 6], ["KR", 6], ["SG", 5], ["Unknown", 9],
];
const DEVICES: Array<[string, number]> = [["desktop", 58], ["mobile", 38], ["tablet", 4]];
const OSES: Array<[string, number]> = [["Windows", 42], ["Android", 30], ["iOS", 16], ["Mac", 8], ["Linux", 4]];
const BROWSERS: Array<[string, number]> = [["Chrome", 60], ["Safari", 18], ["Edge", 12], ["Firefox", 10]];
const UTM = [
  { utmSource: "google", utmMedium: "cpc", utmCampaign: "tet-2026" },
  { utmSource: "facebook", utmMedium: "social", utmCampaign: "ra-mat" },
  { utmSource: "newsletter", utmMedium: "email", utmCampaign: "thang-7" },
  { utmSource: "zalo", utmMedium: "social", utmCampaign: "khuyen-mai" },
];

const seedAdmin = async () => {
  const email = "admin@fixnow.local";
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await User.updateOne(
    { email },
    { $set: { email, passwordHash, fullName: "Admin Demo", role: "ADMIN", status: "ACTIVE", isEmailVerified: true } },
    { upsert: true },
  );
  console.log(`Admin sẵn sàng: ${email} / Admin@123`);
};

const seedEvents = async () => {
  await WebAnalyticsEvent.deleteMany({});
  const visitorPool = Array.from({ length: 320 }, () => rid().slice(0, 32));
  const docs: any[] = [];

  const makePageview = (ts: Date, sessionId: string, visitorHash: string) => {
    const useUtm = Math.random() < 0.18;
    const utm = useUtm ? pick(UTM) : { utmSource: "", utmMedium: "", utmCampaign: "" };
    docs.push({
      type: "pageview",
      path: weighted(PATHS),
      referrerDomain: weighted(REFERRERS),
      hostname: weighted(HOSTS),
      country: weighted(COUNTRIES),
      device: weighted(DEVICES),
      os: weighted(OSES),
      browser: weighted(BROWSERS),
      sessionId,
      ...utm,
      visitorHash,
      timestamp: ts,
    });
  };

  // ~700 phiên trải 90 ngày; ~40% phiên chỉ 1 pageview (bounce).
  const SESSIONS = 700;
  for (let i = 0; i < SESSIONS; i++) {
    const dayAgo = weighted(Array.from({ length: 90 }, (_, d) => [d, 90 - d] as [number, number]));
    const base = new Date(Date.now() - dayAgo * 86400000 - Math.floor(Math.random() * 86400000));
    const visitorHash = pick(visitorPool);
    const sessionId = rid();
    const pages = Math.random() < 0.4 ? 1 : 2 + Math.floor(Math.random() * 4);
    for (let p = 0; p < pages; p++) {
      makePageview(new Date(base.getTime() + p * 60000), sessionId, visitorHash);
    }
  }

  // ~24 sự kiện trong 5 phút gần nhất để realtime "online" > 0.
  for (let i = 0; i < 24; i++) {
    const ts = new Date(Date.now() - Math.floor(Math.random() * 5 * 60000));
    makePageview(ts, rid(), pick(visitorPool));
  }

  // ~90 custom event (không phải pageview).
  for (let i = 0; i < 90; i++) {
    const ts = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000);
    docs.push({
      type: pick(["click_dat_lich", "click_goi_dien", "submit_lien_he"]),
      path: weighted(PATHS),
      referrerDomain: weighted(REFERRERS),
      hostname: weighted(HOSTS),
      country: weighted(COUNTRIES),
      device: weighted(DEVICES),
      os: weighted(OSES),
      browser: weighted(BROWSERS),
      sessionId: rid(),
      utmSource: "", utmMedium: "", utmCampaign: "",
      visitorHash: pick(visitorPool),
      timestamp: ts,
    });
  }

  await WebAnalyticsEvent.insertMany(docs);
  console.log(`Đã seed ${docs.length} event (${SESSIONS} phiên + realtime + custom).`);
};

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI chưa được đặt");
  await mongoose.connect(uri);
  console.log("Đã kết nối MongoDB:", uri.replace(/\/\/.*@/, "//***@"));
  await seedAdmin();
  await seedEvents();
  await mongoose.disconnect();
  console.log("Seed hoàn tất.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed lỗi:", err);
  process.exit(1);
});
