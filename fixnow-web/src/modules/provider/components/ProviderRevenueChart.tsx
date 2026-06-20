import { BarChart3, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../shared/utils/format'
import type { RevenuePoint } from '../types/providerTypes'

type RevenueRange = 'day' | 'month' | 'year'

const rangeLabels: Record<RevenueRange, string> = {
  day: '7 ngày',
  month: '12 tháng',
  year: '5 năm',
}

const chart = {
  width: 900,
  height: 245,
  top: 18,
  right: 18,
  bottom: 14,
  left: 72,
}

export function ProviderRevenueChart({
  data,
  range,
  onRangeChange,
  loading,
  error,
}: {
  data: RevenuePoint[]
  range: RevenueRange
  onRangeChange: (range: RevenueRange) => void
  loading: boolean
  error: boolean
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const totalRevenue = data.reduce((sum, point) => sum + point.totalRevenue, 0)
  const totalOrders = data.reduce((sum, point) => sum + point.totalOrders, 0)
  const previousRevenue = data.slice(0, -1).reduce((sum, point) => sum + point.totalRevenue, 0)
  const currentRevenue = data.at(-1)?.totalRevenue ?? 0
  const previousPointRevenue = data.at(-2)?.totalRevenue ?? 0
  const trend = previousPointRevenue
    ? ((currentRevenue - previousPointRevenue) / previousPointRevenue) * 100
    : currentRevenue > 0 ? 100 : 0

  const geometry = useMemo(() => createChartGeometry(data), [data])
  const activePoint = activeIndex === null ? null : data[activeIndex]
  const activePosition = activeIndex === null ? null : geometry.points[activeIndex]

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><BarChart3 size={21} /></span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Tổng quan doanh thu</h2>
                <p className="text-sm text-slate-500">Thu nhập thực nhận từ giao dịch thành công</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Tổng doanh thu</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">{formatCurrency(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Đơn thành công</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">{totalOrders}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">So với kỳ trước</p>
                <p className={`mt-1 flex items-center gap-1 text-lg font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  <TrendingUp size={18} className={trend < 0 ? 'rotate-180' : ''} />
                  {Math.abs(trend).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-blue-200" />
                Doanh thu từng kỳ
              </span>
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
                Xu hướng doanh thu
              </span>
            </div>
          </div>

          <div className="flex w-fit rounded-xl bg-slate-100 p-1" aria-label="Khoảng thời gian doanh thu">
            {(Object.keys(rangeLabels) as RevenueRange[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setActiveIndex(null)
                  onRangeChange(value)
                }}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                  range === value
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {rangeLabels[value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        ) : error ? (
          <div className="flex h-64 items-center justify-center rounded-xl bg-red-50 px-4 text-center text-sm text-red-600">
            Không thể tải dữ liệu doanh thu.
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <div className="relative min-w-175">
              {activePoint && activePosition && (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-xl"
                  style={{
                    left: `${(activePosition.x / chart.width) * 100}%`,
                    top: `${Math.max((activePosition.y / chart.height) * 100 - 17, 0)}%`,
                  }}
                >
                  <p className="font-semibold">{activePoint.label ?? formatPointLabel(activePoint)}</p>
                  <p className="mt-1 whitespace-nowrap text-slate-200">{formatCurrency(activePoint.totalRevenue)}</p>
                  <p className="text-slate-400">{activePoint.totalOrders} đơn thành công</p>
                </div>
              )}

              <svg
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                className="h-auto w-full overflow-visible"
                role="img"
                aria-label={`Biểu đồ doanh thu ${rangeLabels[range]}`}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <defs>
                  <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                    <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.07" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.35" />
                  </filter>
                </defs>

                {geometry.ticks.map((tick) => (
                  <g key={tick.value}>
                    <line
                      x1={chart.left}
                      x2={chart.width - chart.right}
                      y1={tick.y}
                      y2={tick.y}
                      stroke="#e2e8f0"
                      strokeDasharray="5 5"
                    />
                    <text x={chart.left - 12} y={tick.y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">
                      {formatCompactCurrency(tick.value)}
                    </text>
                  </g>
                ))}

                {geometry.points.map((point, index) => (
                  <rect
                    key={`bar-${point.x}`}
                    x={point.barX}
                    y={point.y}
                    width={point.barWidth}
                    height={Math.max(geometry.baseline - point.y, 1)}
                    rx="6"
                    fill={activeIndex === index ? '#60a5fa' : '#bfdbfe'}
                    opacity={activeIndex === null || activeIndex === index ? 0.85 : 0.45}
                    className="pointer-events-none transition-all"
                  />
                ))}

                <path d={geometry.areaPath} fill="url(#revenueArea)" />
                <path
                  d={geometry.linePath}
                  fill="none"
                  stroke="url(#revenueLine)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {geometry.points.map((point, index) => (
                  <g key={`${point.x}-${point.y}`}>
                    <rect
                      x={point.hitX}
                      y={chart.top}
                      width={point.hitWidth}
                      height={chart.height - chart.top - chart.bottom}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${data[index]?.label ?? formatPointLabel(data[index])}: ${formatCurrency(data[index]?.totalRevenue)}`}
                    />
                    {activeIndex === index && (
                      <line
                        x1={point.x}
                        x2={point.x}
                        y1={chart.top}
                        y2={chart.height - chart.bottom}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                      />
                    )}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={activeIndex === index ? 7 : 5}
                      fill="#ffffff"
                      stroke={activeIndex === index ? '#1d4ed8' : '#2563eb'}
                      strokeWidth="3"
                      filter="url(#pointGlow)"
                      className="pointer-events-none transition-all"
                    />
                  </g>
                ))}
              </svg>

              <div
                className="grid pl-[8%] pr-[2%]"
                style={{ gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))` }}
              >
                {data.map((point, index) => (
                  <button
                    key={`${point._id.year}-${point._id.month ?? ''}-${point._id.day ?? ''}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={`truncate px-0.5 py-2 text-center text-[11px] font-semibold transition ${
                      activeIndex === index ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    {point.label ?? formatPointLabel(point)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {!loading && !error && previousRevenue === 0 && totalRevenue === 0 && (
          <p className="mt-3 text-center text-sm text-slate-400">Chưa có doanh thu trong khoảng thời gian này.</p>
        )}
      </div>
    </section>
  )
}

function createChartGeometry(data: RevenuePoint[]) {
  const plotWidth = chart.width - chart.left - chart.right
  const plotHeight = chart.height - chart.top - chart.bottom
  const rawMax = Math.max(...data.map((point) => point.totalRevenue), 0)
  const axisMax = getNiceMaximum(rawMax)
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth / 2

  const points = data.map((point, index) => {
    const x = data.length > 1 ? chart.left + stepX * index : chart.left + plotWidth / 2
    const y = chart.top + plotHeight - (point.totalRevenue / axisMax) * plotHeight
    const hitWidth = data.length > 1 ? Math.max(stepX, 30) : plotWidth
    const barWidth = Math.min(Math.max(stepX * 0.5, 18), 52)
    return {
      x,
      y,
      hitWidth,
      hitX: Math.max(chart.left, x - hitWidth / 2),
      barWidth,
      barX: x - barWidth / 2,
    }
  })

  const linePath = createSmoothPath(points)
  const baseline = chart.height - chart.bottom
  const areaPath = points.length
    ? `${linePath} L ${points.at(-1)?.x} ${baseline} L ${points[0].x} ${baseline} Z`
    : ''
  const ticks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4
    return {
      value: axisMax * (1 - ratio),
      y: chart.top + plotHeight * ratio,
    }
  })

  return { points, linePath, areaPath, ticks, baseline }
}

function createSmoothPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const middleX = (previous.x + point.x) / 2
    return `${path} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

function getNiceMaximum(value: number) {
  if (value <= 0) return 1_000_000
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000_000) return `${trimDecimal(value / 1_000_000_000)} tỷ`
  if (value >= 1_000_000) return `${trimDecimal(value / 1_000_000)} tr`
  if (value >= 1_000) return `${trimDecimal(value / 1_000)}k`
  return String(Math.round(value))
}

function trimDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatPointLabel(point?: RevenuePoint) {
  if (!point) return ''
  if (point._id.day) return `${point._id.day}/${point._id.month}`
  if (point._id.month) return `T${point._id.month}/${point._id.year}`
  return String(point._id.year)
}
