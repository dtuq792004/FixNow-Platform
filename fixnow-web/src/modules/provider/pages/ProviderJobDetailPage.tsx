import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock3, MapPin, MessageCircle, Phone, Wrench } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { chatService } from '../../chat/services/chatService'
import { ProviderJobMap } from '../components/ProviderJobMap'
import { ProviderCard } from '../components/ProviderPageHeader'
import { providerKeys, useProviderJob } from '../hooks/useProvider'
import { providerService } from '../services/providerService'

export function ProviderJobDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { jobId = '' } = useParams()
  const query = useProviderJob(jobId)
  const startMutation = useMutation({
    mutationFn: () => providerService.startJob(jobId),
    onSuccess: (job) => {
      queryClient.setQueryData(providerKeys.job(jobId), job)
      queryClient.invalidateQueries({ queryKey: providerKeys.jobs })
      navigate(`/provider/jobs/${jobId}/start`)
    },
  })
  const chatMutation = useMutation({
    mutationFn: async () => {
      if (query.data?.conversationId) return query.data.conversationId
      const conversation = await chatService.createConversation(query.data!.customerId._id)
      return conversation._id
    },
    onSuccess: (conversationId) => {
      navigate(`/provider/messages?conversation=${conversationId}`)
    },
  })

  if (query.isLoading) {
    return <div className="mx-auto max-w-5xl p-6"><AppSkeleton /></div>
  }

  if (query.isError || !query.data) {
    return <div className="mx-auto max-w-5xl p-6"><ErrorState /></div>
  }

  const job = query.data
  const address =
    job.addressText ||
    [
      job.addressId?.addressLine,
      job.addressId?.ward,
      job.addressId?.district,
      job.addressId?.city,
    ].filter(Boolean).join(', ')

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/provider/jobs')} aria-label="Quay lại danh sách đơn">
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">
            Chi tiết đơn #{job._id.slice(-8).toUpperCase()}
          </h1>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <ProviderCard className="p-6">
            <h2 className="text-lg font-bold">{job.customerId?.fullName}</h2>
            <p className="mt-3 flex gap-2 text-sm text-slate-600">
              <MapPin size={17} />
              {address || 'Chưa cập nhật địa chỉ'}
            </p>
            <div className="mt-5 flex gap-2">
              {job.customerId?.phone && (
                <a
                  href={`tel:${job.customerId.phone}`}
                  aria-label="Gọi khách hàng"
                  className="rounded-xl bg-blue-50 p-3 text-blue-700"
                >
                  <Phone size={19} />
                </a>
              )}
              <AppButton
                variant="outline"
                disabled={chatMutation.isPending}
                onClick={() => chatMutation.mutate()}
              >
                <MessageCircle size={18} />
                Nhắn tin
              </AppButton>
            </div>
            <ProviderJobMap job={job} address={address || 'Địa chỉ khách hàng'} />
          </ProviderCard>

          {job.media?.length ? (
            <ProviderCard className="p-5">
              <h2 className="font-bold">Ảnh khách hàng cung cấp</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {job.media.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Minh chứng yêu cầu"
                    className="aspect-square rounded-xl object-cover"
                  />
                ))}
              </div>
            </ProviderCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <ProviderCard className="p-5">
            <h2 className="flex gap-2 text-lg font-bold">
              <Wrench className="text-blue-600" />
              {job.title || job.categoryId?.name || 'Dịch vụ'}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {job.description || job.note || 'Không có mô tả.'}
            </p>
            <p className="mt-4 flex gap-2 text-sm">
              <Clock3 size={17} />
              {formatDateTime(job.startAt)}
            </p>
            <p className="mt-4 text-xl font-bold text-blue-700">
              {formatCurrency(job.finalPrice || job.totalPrice)}
            </p>
            <div className="mt-5 border-t border-slate-100 pt-5">
              {job.status === 'ACCEPTED' && (
                <AppButton
                  className="w-full"
                  disabled={startMutation.isPending}
                  onClick={() => startMutation.mutate()}
                >
                  {startMutation.isPending ? 'Đang bắt đầu...' : 'Bắt đầu làm'}
                </AppButton>
              )}
              {job.status === 'IN_PROGRESS' && (
                <AppButton
                  className="w-full"
                  onClick={() => navigate(`/provider/jobs/${jobId}/start`)}
                >
                  Tiếp tục công việc
                </AppButton>
              )}
              {job.status === 'COMPLETED' && (
                <p className="text-sm font-semibold text-green-700">
                  Công việc đã hoàn thành.
                </p>
              )}
            </div>
          </ProviderCard>
        </div>
      </div>
    </div>
  )
}
