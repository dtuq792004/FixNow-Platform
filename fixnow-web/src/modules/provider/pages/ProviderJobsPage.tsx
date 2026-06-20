import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { AppPagination } from '../../../shared/components/AppPagination'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { ProviderPageHeader } from '../components/ProviderPageHeader'
import { providerKeys, usePaginatedProviderJobs } from '../hooks/useProvider'
import { providerService } from '../services/providerService'
import type { ProviderJobFilter } from '../types/providerTypes'

const tabs: Array<{ label: string; value: ProviderJobFilter }> = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Mới', value: 'PENDING' },
  { label: 'Đã chấp nhận', value: 'ACCEPTED' },
  { label: 'Đang thực hiện', value: 'IN_PROGRESS' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
]

export function ProviderJobsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ProviderJobFilter>('ALL')
  const [page, setPage] = useState(1)
  const jobsQuery = usePaginatedProviderJobs(status, page)
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPT' | 'REJECT' }) =>
      providerService.respondJob(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.availableJobs })
      queryClient.invalidateQueries({ queryKey: providerKeys.jobs })
      if (variables.action === 'ACCEPT') navigate(`/provider/jobs/${variables.id}`)
    },
  })
  const jobs = jobsQuery.data?.docs ?? []
  const statusCounts = jobsQuery.data?.statusCounts

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <ProviderPageHeader title="Quản lý đơn việc" description="Dữ liệu và trạng thái được đồng bộ trực tiếp từ hệ thống." />
      <div className="overflow-x-auto rounded-xl bg-slate-100 p-1">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button key={tab.value} type="button" onClick={() => { setStatus(tab.value); setPage(1) }}
              className={`rounded-lg px-4 py-2 text-sm ${status === tab.value ? 'bg-white font-semibold text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              {tab.label} ({statusCounts?.[tab.value] ?? 0})
            </button>
          ))}
        </div>
      </div>
      {jobsQuery.isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><AppSkeleton /><AppSkeleton /><AppSkeleton /></div>
        : jobsQuery.isError ? <ErrorState />
        : jobs.length === 0 ? <EmptyState message="Không có đơn việc trong trạng thái này." />
        : <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
            <article key={job._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-blue-700 to-cyan-500 p-5 text-white">
                <span className="text-xs font-semibold">{job.categoryId?.name ?? 'Dịch vụ FixNow'}</span>
                <h2 className="mt-5 text-xl font-bold">{job.customerId?.fullName ?? 'Khách hàng'}</h2>
              </div>
              <div className="space-y-4 p-5">
                <div><h3 className="font-bold">{job.title || job.categoryId?.name || 'Yêu cầu dịch vụ'}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{job.description || job.note || 'Không có mô tả.'}</p></div>
                <p className="font-bold text-blue-700">{formatCurrency(job.finalPrice || job.totalPrice)}</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex gap-2"><MapPin size={16} /> {formatAddress(job)}</p>
                  <p className="flex gap-2"><CalendarDays size={16} /> {formatDateTime(job.startAt)}</p>
                </div>
                <div className="flex gap-2">
                  {job.status === 'PENDING' ? <>
                    <AppButton className="flex-1" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: job._id, action: 'ACCEPT' })}>Chấp nhận</AppButton>
                    <AppButton variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: job._id, action: 'REJECT' })}>Từ chối</AppButton>
                  </> : <AppButton className="w-full" onClick={() => navigate(`/provider/jobs/${job._id}`)}>Xem chi tiết</AppButton>}
                </div>
              </div>
            </article>
            ))}
          </div>
          <AppPagination
            page={jobsQuery.data?.page ?? page}
            totalPages={jobsQuery.data?.totalPages ?? 0}
            onPageChange={setPage}
          />
        </>}
    </div>
  )
}

function formatAddress(job: { addressText?: string; addressId?: { addressLine?: string; ward?: string; district?: string; city?: string } }) {
  if (job.addressText) return job.addressText
  const address = job.addressId
  return [address?.addressLine, address?.ward, address?.district, address?.city].filter(Boolean).join(', ') || 'Chưa cập nhật'
}
