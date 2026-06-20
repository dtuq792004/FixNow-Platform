import { CalendarDays, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { EmptyState, ErrorState, AppSkeleton } from '../../../shared/components/PageStates'
import { PageShell } from '../../../shared/components/PageShell'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { cn } from '../../../shared/utils/cn'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { useMyRequestsQuery } from '../hooks/useRequests'
import type { RequestStatus } from '../types/requestTypes'

const filters: Array<{ label: string; statuses?: RequestStatus[] }> = [
  { label: 'Tất cả' },
  { label: 'Đang xử lý', statuses: ['AWAITING_PAYMENT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
  { label: 'Hoàn thành', statuses: ['COMPLETED'] },
  { label: 'Đã hủy', statuses: ['CANCELLED'] },
]

export function ServiceHistoryPage() {
  const navigate = useNavigate()
  const requestsQuery = useMyRequestsQuery()
  const [filter, setFilter] = useState(filters[0])
  const requests = requestsQuery.data?.filter((item) => !filter.statuses || filter.statuses.includes(item.status)) ?? []

  return (
    <PageShell title="Lịch sử dịch vụ" description="Quản lý và theo dõi tất cả yêu cầu của bạn." action={<AppButton onClick={() => navigate('/customer/request/new')}>Đặt dịch vụ mới</AppButton>}>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((item) => <button key={item.label} onClick={() => setFilter(item)} className={cn('shrink-0 rounded-full px-5 py-2 text-sm font-semibold', filter.label === item.label ? 'bg-blue-600 text-white' : 'bg-white text-slate-600')}>{item.label}</button>)}
      </div>
      {requestsQuery.isPending && <div className="space-y-4"><AppSkeleton /><AppSkeleton /></div>}
      {requestsQuery.isError && <ErrorState message={requestsQuery.error.message} />}
      {!requestsQuery.isPending && !requestsQuery.isError && !requests.length && <EmptyState message="Chưa có yêu cầu phù hợp." />}
      <div className="space-y-4">
        {requests.map((item) => {
          const category = typeof item.categoryId === 'object' ? item.categoryId.name : undefined
          const address = typeof item.addressId === 'object'
            ? [item.addressId.addressLine, item.addressId.ward, item.addressId.district, item.addressId.city].filter(Boolean).join(', ')
            : item.addressText
          return (
            <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div><div className="flex flex-wrap items-center gap-3"><span className="text-xs text-slate-400">#{item._id.slice(-8).toUpperCase()}</span><StatusBadge status={item.status} /></div><h2 className="mt-3 text-lg font-bold">{item.title || category || 'Yêu cầu dịch vụ'}</h2><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span className="flex items-center gap-2"><CalendarDays size={16} />{formatDateTime(item.startAt || item.createdAt)}</span><span className="flex items-center gap-2"><MapPin size={16} />{address || 'Chưa có địa chỉ'}</span></div></div>
                <div className="flex items-center justify-between gap-4 sm:block sm:text-right"><b className="text-lg text-blue-600">{item.finalPrice ? formatCurrency(item.finalPrice) : 'Chờ báo giá'}</b><div className="mt-0 flex gap-2 sm:mt-4">{item.status === 'COMPLETED' && <AppButton size="sm" variant="outline" onClick={() => navigate(`/customer/review/${item._id}`)}>Đánh giá</AppButton>}{item.status !== 'CANCELLED' && <AppButton size="sm" onClick={() => navigate(`/customer/tracking/${item._id}`)}>Chi tiết</AppButton>}</div></div>
              </div>
            </article>
          )
        })}
      </div>
    </PageShell>
  )
}
