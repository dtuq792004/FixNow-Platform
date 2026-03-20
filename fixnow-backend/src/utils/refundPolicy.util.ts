export function calculateRefundPolicy(
  scheduledTime: Date
) {
  const now = new Date();
  const diffHours =
    (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours >= 2) {
    return { type: "FULL", percent: 100 };
  }

  if (diffHours > 0) {
    return { type: "PARTIAL", percent: 50 };
  }

  return { type: "NONE", percent: 0 };
}