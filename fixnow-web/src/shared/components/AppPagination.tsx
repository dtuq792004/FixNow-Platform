import { ChevronLeft, ChevronRight } from 'lucide-react'

export function AppPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => Math.min(Math.max(1, page - 2), Math.max(1, totalPages - 4)) + index,
  )

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Phân trang">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} /> <span className="hidden sm:inline">Trước</span>
      </button>
      {pages.map((value) => (
        <button
          key={value}
          type="button"
          aria-current={value === page ? 'page' : undefined}
          onClick={() => onPageChange(value)}
          className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold ${
            value === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600'
          }`}
        >
          {value}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="hidden sm:inline">Sau</span> <ChevronRight size={16} />
      </button>
    </nav>
  )
}
