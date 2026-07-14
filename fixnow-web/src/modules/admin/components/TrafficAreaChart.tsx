import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { MetricKey, WebTimePoint } from '../services/webAnalyticsService'

const labelVN = (iso: string) => {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

const fmt = (v: number, metric: MetricKey) =>
  metric === 'bounceRate' ? `${v}%` : v.toLocaleString('vi-VN')

// Ngày cuối (hôm nay) chưa đủ dữ liệu → vẽ nét đứt để không hiểu nhầm là tụt.
export function TrafficAreaChart({ data, metric }: { data: WebTimePoint[]; metric: MetricKey }) {
  const n = data.length
  const chartData = data.map((d, i) => ({
    label: labelVN(d.date),
    solid: i <= n - 2 ? d[metric] : null,
    dashed: i >= n - 2 ? d[metric] : null,
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={52}
            tickFormatter={(v) => (metric === 'bounceRate' ? `${v}%` : v.toLocaleString('vi-VN'))} />
          <Tooltip
            cursor={{ stroke: '#2563eb', strokeOpacity: 0.2 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const p = payload.find((x) => x.value != null)
              if (!p) return null
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                  <div className="font-semibold text-slate-500">{label}</div>
                  <div className="mt-0.5 font-bold text-slate-900">{fmt(Number(p.value), metric)}</div>
                </div>
              )
            }}
          />
          <Area type="monotone" dataKey="solid" stroke="#2563eb" strokeWidth={2.5} fill="url(#trafficFill)" dot={false} connectNulls={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="dashed" stroke="#2563eb" strokeWidth={2.5} strokeDasharray="5 4" dot={false} connectNulls={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="mt-2 text-right text-xs text-slate-400">Giờ Việt Nam (UTC+7) · ngày hôm nay (nét đứt) đang cập nhật</p>
    </div>
  )
}
