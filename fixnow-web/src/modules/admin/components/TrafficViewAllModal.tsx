import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { HorizontalBarChart } from './ReportComponents'
import { webAnalyticsService } from '../services/webAnalyticsService'

export function TrafficViewAllModal({
  open,
  onClose,
  title,
  dimension,
  days,
  labelOf,
}: {
  open: boolean
  onClose: () => void
  title: string
  dimension: string
  days: number
  labelOf: (key: string) => string
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onEsc)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  const query = useQuery({
    queryKey: ['web', 'breakdown', dimension, days],
    queryFn: () => webAnalyticsService.breakdown(dimension, days, 100),
    enabled: open,
  })

  if (!open) return null

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${title} — Top 100`}
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-extrabold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-400">Top 100</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </header>
        <div className="min-h-32 flex-1 overflow-y-auto px-5 py-4">
          {query.isLoading && <p className="py-8 text-center text-sm text-slate-500">Đang tải dữ liệu...</p>}
          {query.error && <p className="py-8 text-center text-sm text-red-600">Không tải được dữ liệu.</p>}
          {query.data && (items.length ? (
            <HorizontalBarChart items={items.map((it) => ({ key: it.key, label: labelOf(it.key), value: it.visitors }))} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu.</p>
          ))}
        </div>
        <footer className="border-t border-slate-200 px-5 py-3 text-right text-xs font-semibold text-slate-500">
          Hiển thị {items.length}/{total}
        </footer>
      </section>
    </div>,
    document.body,
  )
}
