import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { PageShell } from '../../../shared/components/PageShell'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { useConfirm } from '../../../shared/store/confirmStore'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { chatService } from '../../chat/services/chatService'
import { addressService } from '../../profile/services/addressService'
import { CustomerProviderTracking } from '../components/CustomerProviderTracking'
import { requestKeys, useCancelRequestMutation, useRequestQuery } from '../hooks/useRequests'
import type { RequestStatus } from '../types/requestTypes'

const lifecycle: Array<{ status: RequestStatus; title: string }> = [
  { status: 'PENDING', title: 'Đã tiếp nhận' },
  { status: 'ACCEPTED', title: 'Provider đã xác nhận' },
  { status: 'IN_PROGRESS', title: 'Đang thực hiện' },
  { status: 'COMPLETED', title: 'Hoàn thành' },
]

export function TrackingProcessPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const requestQuery = useRequestQuery(requestId)
  const cancelMutation = useCancelRequestMutation()
  const geocodeMutation = useMutation({
    mutationFn: async () => {
      const savedAddress = requestQuery.data?.addressId
      if (!savedAddress || typeof savedAddress !== 'object') {
        throw new Error('Booking không còn liên kết với địa chỉ đã lưu.')
      }
      const response = await addressService.update(savedAddress._id, {
        addressLine: savedAddress.addressLine,
        ward: savedAddress.ward,
        district: savedAddress.district,
        city: savedAddress.city,
      })
      if (typeof response.data.latitude !== 'number' || typeof response.data.longitude !== 'number') {
        throw new Error('Không tìm thấy tọa độ. Hãy kiểm tra lại địa chỉ hoặc dùng GPS trong hồ sơ.')
      }
      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId ?? '') })
    },
  })
  const chatMutation = useMutation({
    mutationFn: async () => {
      if (requestQuery.data?.conversationId) return requestQuery.data.conversationId
      const assignedProvider =
        requestQuery.data && typeof requestQuery.data.providerId === 'object'
          ? requestQuery.data.providerId
          : undefined
      if (!assignedProvider) throw new Error('Provider chưa được gán')
      const conversation = await chatService.createConversation(assignedProvider._id)
      return conversation._id
    },
    onSuccess: (conversationId) => {
      navigate(`/customer/chat?conversation=${conversationId}`)
    },
  })

  if (requestQuery.isPending) return <PageShell title="Theo dõi tiến độ" description="Đang tải yêu cầu..."><AppSkeleton /></PageShell>
  if (requestQuery.isError || !requestQuery.data) return <PageShell title="Theo dõi tiến độ" description="Không thể tải yêu cầu."><ErrorState message={requestQuery.error?.message} /></PageShell>

  const request = requestQuery.data
  const provider = request.providerId && typeof request.providerId === 'object' ? request.providerId : undefined
  const category = request.categoryId && typeof request.categoryId === 'object' ? request.categoryId.name : 'Dịch vụ'
  const address = request.addressId && typeof request.addressId === 'object'
    ? [request.addressId.addressLine, request.addressId.ward, request.addressId.district, request.addressId.city].filter(Boolean).join(', ')
    : request.addressText
  const currentIndex = lifecycle.findIndex((item) => item.status === request.status)

  const cancel = async () => {
    if (!requestId) return
    const confirmed = await confirm({
      title: 'Hủy yêu cầu dịch vụ?',
      description:
        'Yêu cầu sẽ bị dừng và Provider sẽ không tiếp tục nhận hoặc xử lý công việc này.',
      confirmLabel: 'Hủy yêu cầu',
      variant: 'danger',
    })
    if (!confirmed) return
    await cancelMutation.mutateAsync(requestId)
  }

  return (
    <PageShell title="Theo dõi tiến độ" description={`Yêu cầu #${request._id.slice(-8).toUpperCase()}`} action={<StatusBadge status={request.status} />}>
      <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Tiến độ công việc</h2>
            {request.status === 'AWAITING_PAYMENT' && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">Yêu cầu đang chờ thanh toán để được chuyển tới provider.</p>}
            {request.status === 'CANCELLED' && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Yêu cầu đã bị hủy.</p>}
            <div className="mt-6 grid items-stretch gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="font-bold text-slate-900">Các bước thực hiện</h3>
                <p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái xử lý đơn.</p>
                <div className="mt-5">
              {lifecycle.map((step, index) => {
                const done = currentIndex >= index && request.status !== 'CANCELLED'
                const active = currentIndex === index
                return <div key={step.status} className="relative flex gap-4 pb-7 last:pb-0">{index < lifecycle.length - 1 && <span className={`absolute left-[17px] top-9 h-full w-0.5 ${done ? 'bg-blue-500' : 'bg-slate-200'}`} />}<span className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{done ? <Check size={18} /> : index + 1}</span><div><h3 className={active ? 'font-bold text-blue-600' : 'font-bold'}>{step.title}</h3><p className="mt-1 text-sm text-slate-500">{active ? `Cập nhật ${formatDateTime(request.updatedAt)}` : done ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</p></div></div>
              })}
                </div>
              </div>
            <CustomerProviderTracking
              requestId={request._id}
              status={request.status}
              address={address || 'Địa chỉ khách hàng'}
              latitude={request.addressId && typeof request.addressId === 'object' ? request.addressId.latitude : undefined}
              longitude={request.addressId && typeof request.addressId === 'object' ? request.addressId.longitude : undefined}
              hasProvider={Boolean(provider)}
              canGeocodeAddress={Boolean(request.addressId && typeof request.addressId === 'object')}
              isGeocoding={geocodeMutation.isPending}
              geocodingError={geocodeMutation.error?.message}
              onGeocodeAddress={() => geocodeMutation.mutate()}
            />
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            {provider ? <><div className="flex items-center gap-4">{provider.avatar ? <img src={provider.avatar} alt={provider.fullName} className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-blue-100" />}<div><p className="text-sm text-slate-500">Kỹ thuật viên</p><h2 className="text-lg font-bold">{provider.fullName}</h2></div></div><div className="mt-5 grid grid-cols-2 gap-3"><AppButton asChild><a href={provider.phone ? `tel:${provider.phone}` : undefined}><Phone size={17} /> Gọi điện</a></AppButton><AppButton variant="outline" disabled={chatMutation.isPending} onClick={() => chatMutation.mutate()}><MessageCircle size={17} /> Nhắn tin</AppButton></div></> : <p className="text-sm text-slate-500">Hệ thống đang tìm provider phù hợp.</p>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold">Thông tin yêu cầu</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Dịch vụ</dt><dd className="text-right font-semibold">{request.title || category}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Thời gian</dt><dd className="text-right font-semibold">{formatDateTime(request.startAt)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Chi phí</dt><dd className="text-right font-semibold text-blue-600">{request.finalPrice ? formatCurrency(request.finalPrice) : 'Chờ báo giá'}</dd></div>
            </dl>
            <p className="mt-4 flex gap-2 border-t pt-4 text-sm text-slate-500"><MapPin size={18} className="mt-0.5 shrink-0" />{address || 'Chưa có địa chỉ'}</p>
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-bold text-slate-800">Mô tả yêu cầu</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{request.description || request.note || 'Không có mô tả.'}</p>
              {!!request.completionMedia?.length && <div className="mt-4 grid grid-cols-2 gap-2">{request.completionMedia.map((url) => <img key={url} src={url} alt="Ảnh hoàn thành" className="h-28 w-full rounded-xl object-cover" />)}</div>}
            </div>
          </section>
          <div className="flex gap-3 rounded-2xl bg-green-50 p-5 text-sm text-green-700"><ShieldCheck size={23} className="shrink-0" /><p>Dịch vụ được quản lý và hỗ trợ bởi FixNow.</p></div>
          {!['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(request.status) && <AppButton variant="danger" className="w-full" onClick={cancel} disabled={cancelMutation.isPending}>Hủy yêu cầu</AppButton>}
        </aside>
      </div>
    </PageShell>
  )
}
