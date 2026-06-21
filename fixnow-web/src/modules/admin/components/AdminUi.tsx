import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'

export function AdminPageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">FixNow Admin</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-[28px]">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function AdminStatCard({ label, value, icon: Icon, tone = 'blue', change }: { label: string; value: string; icon: LucideIcon; tone?: 'blue' | 'green' | 'amber' | 'purple' | 'red'; change?: string }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="admin-stat-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tones[tone])}><Icon size={21} /></span>
        {change && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">{change}</span>}
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

export function AdminToolbar({ placeholder = 'Tìm kiếm...', children, value, onChange }: { placeholder?: string; children?: ReactNode; value?: string; onChange?: (value: string) => void }) {
  return (
    <div className="admin-toolbar flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input value={value} onChange={(event) => onChange?.(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" placeholder={placeholder} />
      </label>
      {children}
    </div>
  )
}

export function AdminBadge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'purple' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ring-black/[0.04]', tones[tone])}>{children}</span>
}

export function AdminPagination({ page = 1, total = 0, limit = 10, totalPages = 1, onPageChange }: { page?: number; total?: number; limit?: number; totalPages?: number; onPageChange?: (page: number) => void }) {
  const start = total ? (page - 1) * limit + 1 : 0
  const end = Math.min(page * limit, total)
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3">
      <p className="hidden text-sm text-slate-500 sm:block">Hiển thị {start}–{end} trong {total} kết quả</p>
      <div className="ml-auto flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} type="button" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40"><ChevronLeft size={16} /></button>
        <span className="min-w-12 text-center text-sm font-bold">{page}/{Math.max(1, totalPages)}</span>
        <button disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)} type="button" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40"><ChevronRight size={16} /></button>
      </div>
    </div>
  )
}

export function AdminLoading() {
  return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
}

export function AdminError({ message = 'Không thể tải dữ liệu.' }: { message?: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{message}</div>
}
