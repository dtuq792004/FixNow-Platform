/**
 * Rate-limit fixed-window trong bộ nhớ cho endpoint public /analytics/collect.
 * Lưu ý: chỉ có tác dụng trong 1 tiến trình. Backend deploy trên Render (1 instance
 * chạy dài hạn) nên đủ dùng; state reset khi deploy/spin-down là chấp nhận được.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = Number(process.env.ANALYTICS_RATE_LIMIT) || 120;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

export const isRateLimited = (ip: string): boolean => {
  if (!ip) return false;
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.windowStart >= WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    return false;
  }
  b.count += 1;
  return b.count > MAX_PER_WINDOW;
};

// Dọn bucket cũ định kỳ (không quét mỗi request để tránh chi phí lúc bị flood).
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [ip, b] of buckets) {
    if (now - b.windowStart >= WINDOW_MS * 2) buckets.delete(ip);
  }
}, WINDOW_MS);
cleanup.unref?.();
