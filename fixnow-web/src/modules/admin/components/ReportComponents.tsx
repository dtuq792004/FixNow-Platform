import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../../shared/utils/cn'

const reportLinks = [
  { to: '/admin/analytics/traffic', label: 'Lưu lượng web' },
  { to: '/admin/analytics/blog-views', label: 'Lượt xem blog' },
  { to: '/admin/analytics/revenue', label: 'Doanh thu' },
  { to: '/admin/analytics/catalog', label: 'Danh mục & dịch vụ' },
]

export function ReportTabs() {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {reportLinks.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            'whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100',
            isActive && 'bg-blue-600 text-white hover:bg-blue-600',
          )}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function WeekNavigator({
  startDate,
  endDate,
  weekOffset,
  onChange,
}: {
  startDate: string
  endDate: string
  weekOffset: number
  onChange: (offset: number) => void
}) {
  const format = (value: string) => new Date(`${value}T12:00:00+07:00`).toLocaleDateString('vi-VN')
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(weekOffset - 1)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:border-blue-300 hover:text-blue-600" aria-label="Tuần trước">
        <ChevronLeft size={18} />
      </button>
      <div className="min-w-44 rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-bold text-slate-700">
        {format(startDate)} – {format(endDate)}
      </div>
      <button type="button" disabled={weekOffset >= 0} onClick={() => onChange(Math.min(0, weekOffset + 1))} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Tuần sau">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export function VerticalBarChart<T extends { date: string; label: string }>({
  items,
  value,
  formatValue = (item) => String(value(item)),
  color = 'bg-blue-600',
}: {
  items: T[]
  value: (item: T) => number
  formatValue?: (item: T) => string
  color?: string
}) {
  const max = Math.max(1, ...items.map(value))
  return (
    <div className="overflow-x-auto">
      <div className="flex h-80 min-w-[620px] items-end gap-3 border-b border-slate-200 px-2 pt-12">
        {items.map((item) => {
          const itemValue = value(item)
          return (
            <div key={item.date} className="group flex h-full flex-1 flex-col justify-end">
              <div className="mb-2 text-center text-xs font-bold text-slate-600">{formatValue(item)}</div>
              <div className="flex h-[230px] items-end justify-center">
                <div
                  title={`${item.label}: ${formatValue(item)}`}
                  className={cn('w-full max-w-14 rounded-t-xl transition-all group-hover:brightness-110', color)}
                  style={{ height: itemValue ? `${Math.max(5, itemValue / max * 100)}%` : '3px' }}
                />
              </div>
              <div className="mt-3 min-h-10 text-center text-xs font-semibold text-slate-500">{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function HorizontalBarChart({
  items,
}: {
  items: Array<{ key: string; label: string; value: number; secondary?: string }>
}) {
  const max = Math.max(1, ...items.map((item) => item.value))
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.key}>
          <div className="mb-2 flex justify-between gap-4 text-sm">
            <span className="truncate font-semibold text-slate-700">{item.label}</span>
            <span className="shrink-0 font-bold text-slate-900">{item.value}{item.secondary ? ` · ${item.secondary}` : ''}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${item.value / max * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
