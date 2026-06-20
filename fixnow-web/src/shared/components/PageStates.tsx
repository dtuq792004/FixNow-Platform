export function AppSkeleton() {
  return <div className="h-28 animate-pulse rounded-2xl bg-slate-200" aria-label="Đang tải" />
}

export function EmptyState({ message = 'Chưa có dữ liệu' }: { message?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">{message}</div>
}

export function ErrorState({ message = 'Không thể tải dữ liệu. Vui lòng thử lại.' }: { message?: string }) {
  return <div className="rounded-2xl bg-red-50 p-5 text-center text-red-700">{message}</div>
}
