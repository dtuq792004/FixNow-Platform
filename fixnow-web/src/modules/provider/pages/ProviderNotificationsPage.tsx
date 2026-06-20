import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BellRing, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { AppButton } from '../../../shared/components/AppButton'
import { AppPagination } from '../../../shared/components/AppPagination'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { formatDateTime } from '../../../shared/utils/format'
import { ProviderPageHeader } from '../components/ProviderPageHeader'
import { providerKeys } from '../hooks/useProvider'
import { providerService } from '../services/providerService'

export function ProviderNotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const query = useQuery({ queryKey: providerKeys.notifications, queryFn: providerService.getNotifications })
  const readAll = useMutation({
    mutationFn: providerService.readAllNotifications,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.notifications }),
  })
  const readOne = useMutation({
    mutationFn: providerService.readNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.notifications }),
  })
  const notifications = query.data ?? []
  const totalPages = Math.ceil(notifications.length / 10)
  const visibleNotifications = notifications.slice((page - 1) * 10, page * 10)
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
    <ProviderPageHeader title="Trung tâm thông báo" description="Thông báo được tải theo tài khoản đang đăng nhập." action={<AppButton variant="outline" disabled={readAll.isPending} onClick={() => readAll.mutate()}><CheckCheck size={18} /> Đánh dấu đã đọc</AppButton>} />
    {query.isLoading ? <><AppSkeleton /><AppSkeleton /></> : query.isError ? <ErrorState /> : !query.data?.length ? <EmptyState message="Chưa có thông báo." /> : <div className="space-y-3">
      {visibleNotifications.map((item) => <button type="button" key={item._id} onClick={() => !item.isRead && readOne.mutate(item._id)} className={`flex w-full gap-4 rounded-2xl border bg-white p-5 text-left shadow-sm ${item.isRead ? 'opacity-70' : 'border-blue-200'}`}>
        <span className="rounded-xl bg-blue-100 p-3 text-blue-700"><BellRing size={20} /></span>
        <span className="min-w-0 flex-1"><span className="flex justify-between gap-3"><b>{item.title}</b><small className="shrink-0 text-slate-400">{formatDateTime(item.createdAt)}</small></span><span className="mt-2 block text-sm text-slate-500">{item.message}</span></span>
        {!item.isRead && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600" />}
      </button>)}
      <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>}
  </div>
}
