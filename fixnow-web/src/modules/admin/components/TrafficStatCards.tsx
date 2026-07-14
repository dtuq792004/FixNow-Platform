import { ArrowDown, ArrowUp, Eye, MousePointerClick, Users } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import type { MetricKey, WebSummary } from '../services/webAnalyticsService'

type Meta = { label: string; good: 'up' | 'down'; icon: typeof Users; format: (v: number) => string }

const META: Record<MetricKey, Meta> = {
  visitors: { label: 'Khách (duy nhất theo ngày)', good: 'up', icon: Users, format: (v) => v.toLocaleString('vi-VN') },
  pageviews: { label: 'Lượt xem trang', good: 'up', icon: Eye, format: (v) => v.toLocaleString('vi-VN') },
  bounceRate: { label: 'Tỷ lệ thoát (ước tính)', good: 'down', icon: MousePointerClick, format: (v) => `${v}%` },
}

const ORDER: MetricKey[] = ['visitors', 'pageviews', 'bounceRate']

function ChangeBadge({ change, good }: { change: number | null; good: 'up' | 'down' }) {
  if (change === null) {
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">Mới</span>
  }
  const up = change >= 0
  // Tốt hay xấu tuỳ metric: bounce tăng = xấu (đỏ), visitors tăng = tốt (xanh).
  const isGood = (up && good === 'up') || (!up && good === 'down')
  const tone = change === 0 ? 'bg-slate-100 text-slate-500' : isGood ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-bold', tone)}>
      {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {Math.abs(change)}%
    </span>
  )
}

export function TrafficStatCards({
  summary,
  selected,
  onSelect,
}: {
  summary: WebSummary
  selected: MetricKey
  onSelect: (m: MetricKey) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ORDER.map((key) => {
        const meta = META[key]
        const Icon = meta.icon
        const active = selected === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={active}
            className={cn(
              'rounded-2xl border bg-white p-5 text-left shadow-sm transition',
              active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={19} /></span>
              <ChangeBadge change={summary.change[key]} good={meta.good} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{meta.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{meta.format(summary[key])}</p>
          </button>
        )
      })}
    </div>
  )
}
