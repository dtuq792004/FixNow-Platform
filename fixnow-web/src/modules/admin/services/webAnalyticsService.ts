import { authenticatedRequest } from '../../auth/services/authService'

export type MetricKey = 'visitors' | 'pageviews' | 'bounceRate'
export type BreakdownMetric = Exclude<MetricKey, 'bounceRate'>

export type BreakdownItem = { key: string; visitors: number; pageviews: number }

export type WebSummary = {
  visitors: number
  pageviews: number
  bounceRate: number
  prev: { visitors: number; pageviews: number; bounceRate: number }
  change: Record<MetricKey, number | null>
}

export type WebTimePoint = { date: string; visitors: number; pageviews: number; bounceRate: number }

export type WebOverview = {
  days: number
  summary: WebSummary
  timeseries: WebTimePoint[]
  pages: BreakdownItem[]
  hostnames: BreakdownItem[]
  referrers: BreakdownItem[]
  utmSources: BreakdownItem[]
  countries: BreakdownItem[]
  devices: BreakdownItem[]
  browsers: BreakdownItem[]
  os: BreakdownItem[]
}

export type WebBreakdown = { items: BreakdownItem[]; total: number }

export type WebRealtime = {
  online: number
  pageviews30m: number
  perMinute: Array<{ minute: string; value: number }>
  topPages: Array<{ key: string; value: number }>
}

export const webAnalyticsService = {
  overview: (days: number, metric: BreakdownMetric) =>
    authenticatedRequest<{ data: WebOverview }>(`/admin/analytics/web/overview?days=${days}&metric=${metric}`).then((r) => r.data),

  breakdown: (dimension: string, days: number, metric: BreakdownMetric, limit = 100) =>
    authenticatedRequest<{ data: WebBreakdown }>(
      `/admin/analytics/web/breakdown?dimension=${dimension}&days=${days}&metric=${metric}&limit=${limit}`,
    ).then((r) => r.data),

  realtime: () =>
    authenticatedRequest<{ data: WebRealtime }>('/admin/analytics/web/realtime').then((r) => r.data),
}
