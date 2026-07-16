import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '../../../shared/utils/cn'
import { AdminError, AdminLoading, AdminPageHeader } from '../components/AdminUi'
import { ReportTabs } from '../components/ReportComponents'
import { TrafficStatCards } from '../components/TrafficStatCards'
import { TrafficAreaChart } from '../components/TrafficAreaChart'
import { TrafficBreakdownPanel } from '../components/TrafficBreakdownPanel'
import { countryName } from '../utils/countryName'
import { webAnalyticsService, type BreakdownMetric, type MetricKey } from '../services/webAnalyticsService'

const RANGES = [
  { days: 7, label: '7 ngày qua' },
  { days: 30, label: '30 ngày qua' },
  { days: 90, label: '90 ngày qua' },
]

function OnlineCounter({ online, stale }: { online: number; stale: boolean }) {
  const live = online > 0 && !stale
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold', stale && 'opacity-60')}>
      <span className={cn('h-2.5 w-2.5 rounded-full', live ? 'animate-pulse bg-emerald-500' : 'bg-slate-300')} />
      {stale ? (
        <span className="text-slate-500">Đang chờ cập nhật…</span>
      ) : (
        <span className="text-slate-700">{online} khách đang online</span>
      )}
    </div>
  )
}

export function AdminTrafficReportPage() {
  const [days, setDays] = useState(7)
  const [metric, setMetric] = useState<MetricKey>('pageviews')
  const breakdownMetric: BreakdownMetric = metric === 'visitors' ? 'visitors' : 'pageviews'

  const overview = useQuery({
    queryKey: ['web', 'overview', days, breakdownMetric],
    queryFn: () => webAnalyticsService.overview(days, breakdownMetric),
  })

  const realtime = useQuery({
    queryKey: ['web', 'realtime'],
    queryFn: () => webAnalyticsService.realtime(),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })

  const online = realtime.data?.online ?? 0
  const rtStale = realtime.isError || realtime.isPaused

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Lưu lượng web"
        description="Phân tích truy cập website first-party (không dùng cookie, ẩn danh theo ngày)."
        actions={
          <div className="flex items-center gap-2">
            <OnlineCounter online={online} stale={rtStale} />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
              aria-label="Khoảng thời gian"
            >
              {RANGES.map((r) => (
                <option key={r.days} value={r.days}>{r.label}</option>
              ))}
            </select>
          </div>
        }
      />
      <ReportTabs />

      {overview.isLoading && <AdminLoading />}
      {overview.error && <AdminError message="Không tải được dữ liệu lưu lượng web." />}
      {overview.data && (
        <>
          <TrafficStatCards summary={overview.data.summary} selected={metric} onSelect={setMetric} />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-extrabold text-slate-900">Biểu đồ theo ngày</h2>
            {overview.data.timeseries.some((t) => t.pageviews || t.visitors) ? (
              <TrafficAreaChart data={overview.data.timeseries} metric={metric} />
            ) : (
              <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">Chưa có lượt truy cập trong khoảng này.</p>
            )}
          </section>

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TrafficBreakdownPanel
              days={days}
              metric={breakdownMetric}
              tabs={[
                { key: 'page', label: 'Trang', dimension: 'page', rows: overview.data.pages },
                { key: 'hostname', label: 'Tên miền', dimension: 'hostname', rows: overview.data.hostnames },
              ]}
            />
            <TrafficBreakdownPanel
              days={days}
              metric={breakdownMetric}
              tabs={[
                { key: 'referrer', label: 'Nguồn', dimension: 'referrer', rows: overview.data.referrers },
                { key: 'utmSource', label: 'UTM', dimension: 'utmSource', rows: overview.data.utmSources },
              ]}
            />
            <TrafficBreakdownPanel
              days={days}
              metric={breakdownMetric}
              tabs={[{ key: 'country', label: 'Quốc gia', dimension: 'country', rows: overview.data.countries, labelOf: countryName }]}
            />
            <TrafficBreakdownPanel
              days={days}
              metric={breakdownMetric}
              tabs={[
                { key: 'device', label: 'Thiết bị', dimension: 'device', rows: overview.data.devices },
                { key: 'browser', label: 'Trình duyệt', dimension: 'browser', rows: overview.data.browsers },
              ]}
            />
            <TrafficBreakdownPanel
              days={days}
              metric={breakdownMetric}
              tabs={[{ key: 'os', label: 'Hệ điều hành', dimension: 'os', rows: overview.data.os }]}
            />
          </section>
        </>
      )}
    </div>
  )
}
