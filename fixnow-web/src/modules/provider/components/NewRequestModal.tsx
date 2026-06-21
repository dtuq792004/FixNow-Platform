import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BellRing, Clock3, MapPin, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { providerKeys } from '../hooks/useProvider'
import { providerService } from '../services/providerService'
import type { ProviderJob } from '../types/providerTypes'

type NewRequestModalProps = {
  job: ProviderJob
  expiresAt: string
  onClose: () => void
}

const NOTICE_DURATION_SECONDS = 60

export function NewRequestModal({ job, expiresAt, onClose }: NewRequestModalProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const expiryTime = useMemo(() => new Date(expiresAt).getTime(), [expiresAt])
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Number.isFinite(expiryTime) ? Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000)) : NOTICE_DURATION_SECONDS,
  )
  const acceptMutation = useMutation({
    mutationFn: () => providerService.respondJob(job._id, 'ACCEPT'),
    onSuccess: (acceptedJob) => {
      queryClient.setQueryData(providerKeys.job(job._id), acceptedJob)
      queryClient.invalidateQueries({ queryKey: providerKeys.availableJobs })
      queryClient.invalidateQueries({ queryKey: providerKeys.jobs })
      onClose()
      navigate(`/provider/jobs/${job._id}`)
    },
  })

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  useEffect(() => {
    const updateCountdown = () => {
      if (!Number.isFinite(expiryTime)) return
      const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) onClose()
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [expiryTime, onClose])

  const addressObject = typeof job.addressId === 'object' ? job.addressId : undefined
  const address =
    job.addressText ??
    [addressObject?.addressLine, addressObject?.ward, addressObject?.district, addressObject?.city]
      .filter(Boolean)
      .join(', ')
  const categoryName = typeof job.categoryId === 'object' ? job.categoryId.name : undefined
  const customerName = typeof job.customerId === 'object' ? job.customerId.fullName : 'Khách hàng FixNow'
  const progress = Math.min(100, Math.max(0, (secondsLeft / NOTICE_DURATION_SECONDS) * 100))

  const openJob = () => {
    onClose()
    navigate(`/provider/jobs/${job._id}`)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-request-title"
          className="my-0 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-white shadow-[0_30px_90px_-25px_rgba(15,23,42,0.75)] sm:my-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px]"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-5 pt-5 pb-6 text-white sm:px-6">
            <span className="absolute -top-14 -right-12 h-36 w-36 rounded-full bg-white/10" />
            <span className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-cyan-200/10" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/25">
                  <BellRing className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-blue-100 uppercase">Công việc phù hợp với bạn</p>
                  <h2 id="new-request-title" className="mt-1 text-xl font-extrabold sm:text-2xl">Bạn có đơn việc mới</h2>
                </div>
              </div>
              <button type="button" onClick={onClose} className="shrink-0 rounded-xl p-2 text-white/80 transition hover:bg-white/15 hover:text-white" aria-label="Đóng thông báo">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-blue-50">
                <span>Thời gian xem đơn</span>
                <span>{secondsLeft} giây</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto">
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {categoryName && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{categoryName}</span>}
                  {job.requestType === 'URGENT' && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">Khẩn cấp</span>}
                </div>
                <h3 className="mt-3 text-lg font-extrabold leading-7 text-slate-950 sm:text-xl">
                  {job.title || categoryName || 'Yêu cầu dịch vụ mới'}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {job.description || 'Khách hàng vừa tạo một yêu cầu phù hợp với chuyên môn của bạn.'}
                </p>
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><UserRound size={17} /></span>
                  <div className="min-w-0"><p className="text-xs text-slate-400">Khách hàng</p><p className="mt-0.5 truncate font-semibold text-slate-800">{customerName}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><MapPin size={17} /></span>
                  <div className="min-w-0"><p className="text-xs text-slate-400">Địa điểm thực hiện</p><p className="mt-0.5 break-words font-semibold leading-5 text-slate-800">{address || 'Khách hàng chưa cung cấp địa chỉ chi tiết'}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-amber-600 shadow-sm"><Clock3 size={17} /></span>
                  <div className="min-w-0"><p className="text-xs text-slate-400">Thời gian dự kiến</p><p className="mt-0.5 font-semibold text-slate-800">{formatDateTime(job.startAt)}</p></div>
                </div>
              </div>

              {job.finalPrice > 0 && (
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <span className="text-sm font-semibold text-emerald-700">Giá trị đơn việc</span>
                  <strong className="text-lg text-emerald-700">{formatCurrency(job.finalPrice)}</strong>
                </div>
              )}
            </div>
          </div>

          {acceptMutation.isError && (
            <p className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600">
              {acceptMutation.error.message || 'Không thể nhận đơn. Đơn có thể đã được Provider khác nhận.'}
            </p>
          )}
          <div className="grid shrink-0 grid-cols-1 gap-3 border-t border-slate-100 bg-white p-4 sm:grid-cols-3 sm:p-5">
            <button type="button" disabled={acceptMutation.isPending} onClick={onClose} className="order-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:order-1">
              Để sau
            </button>
            <button type="button" disabled={acceptMutation.isPending} onClick={openJob} className="order-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60">
              Xem chi tiết đơn
            </button>
            <button
              type="button"
              disabled={acceptMutation.isPending || secondsLeft <= 0 || job.status !== 'PENDING'}
              onClick={() => acceptMutation.mutate()}
              className="order-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:order-3"
            >
              {acceptMutation.isPending ? 'Đang nhận đơn...' : 'Nhận đơn'}
            </button>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}
