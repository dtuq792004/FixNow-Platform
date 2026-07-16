import { useState } from 'react'
import { cn } from '../../../shared/utils/cn'
import { HorizontalBarChart } from './ReportComponents'
import { TrafficViewAllModal } from './TrafficViewAllModal'
import type { BreakdownItem, BreakdownMetric } from '../services/webAnalyticsService'

export type PanelTab = {
  key: string
  label: string
  dimension: string
  rows: BreakdownItem[]
  labelOf?: (key: string) => string
}

export function TrafficBreakdownPanel({ tabs, days, metric }: { tabs: PanelTab[]; days: number; metric: BreakdownMetric }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key)
  const [modalOpen, setModalOpen] = useState(false)
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0]
  const labelOf = active.labelOf ?? ((k: string) => k)

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveKey(t.key)}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              t.key === active.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100',
            )}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{metric === 'visitors' ? 'Khách' : 'Lượt xem'}</span>
      </div>

      <div className="min-h-40 flex-1">
        {active.rows.length ? (
          <HorizontalBarChart items={active.rows.map((r) => ({ key: r.key, label: labelOf(r.key), value: r[metric] }))} />
        ) : (
          <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có dữ liệu.</p>
        )}
      </div>

      {active.rows.length > 0 && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-4 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600"
        >
          Xem tất cả
        </button>
      )}

      <TrafficViewAllModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={active.label}
        dimension={active.dimension}
        days={days}
        metric={metric}
        labelOf={labelOf}
      />
    </div>
  )
}
