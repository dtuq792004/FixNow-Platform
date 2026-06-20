import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Star } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { AppTextarea } from '../../../shared/components/AppInput'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { PageShell } from '../../../shared/components/PageShell'
import { getId } from '../../../shared/utils/format'
import { useRequestQuery } from '../hooks/useRequests'
import { feedbackService } from '../services/feedbackService'

const reviewSchema = z.object({ comment: z.string().min(10, 'Vui lòng chia sẻ ít nhất 10 ký tự') })
type ReviewForm = z.infer<typeof reviewSchema>

export function ReviewServicePage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const requestQuery = useRequestQuery(requestId)
  const [rating, setRating] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema) })

  if (requestQuery.isPending) return <PageShell title="Đánh giá dịch vụ" description="Đang tải..."><AppSkeleton /></PageShell>
  if (requestQuery.isError || !requestQuery.data) return <PageShell title="Đánh giá dịch vụ" description="Không thể tải yêu cầu."><ErrorState message={requestQuery.error?.message} /></PageShell>
  const request = requestQuery.data
  const provider = typeof request.providerId === 'object' ? request.providerId : undefined

  if (request.status !== 'COMPLETED' || !provider) return <PageShell title="Đánh giá dịch vụ" description="Yêu cầu chưa đủ điều kiện đánh giá."><ErrorState message="Chỉ yêu cầu đã hoàn thành và có provider mới có thể được đánh giá." /></PageShell>
  if (submitted) return <PageShell title="Cảm ơn bạn đã đánh giá!" description="Đánh giá của bạn đã được ghi nhận."><div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center"><CheckCircle2 className="mx-auto text-green-500" size={56} /><AppButton className="mt-6" onClick={() => navigate('/customer/history')}>Quay lại lịch sử</AppButton></div></PageShell>

  const submit = async (data: ReviewForm) => {
    if (!requestId) return
    setSubmitting(true)
    try {
      await feedbackService.create({
        requestId,
        providerId: getId(provider),
        servicesFeedbacks: [{ serviceId: getId(request.services?.[0]), rating, comment: data.comment }],
      })
      setSubmitted(true)
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'Không thể gửi đánh giá' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell title="Đánh giá dịch vụ" description={`Yêu cầu #${request._id.slice(-8).toUpperCase()}`}>
      <form onSubmit={form.handleSubmit(submit)} className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5">{provider.avatar ? <img src={provider.avatar} alt={provider.fullName} className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-blue-100" />}<div><p className="text-sm text-slate-500">Kỹ thuật viên</p><h2 className="text-lg font-bold">{provider.fullName}</h2></div></div>
        <div className="py-8 text-center"><h3 className="text-xl font-bold">Bạn hài lòng chứ?</h3><div className="mt-4 flex justify-center gap-2">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} sao`}><Star size={38} className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} /></button>)}</div></div>
        <AppTextarea label="Chia sẻ trải nghiệm" error={form.formState.errors.comment?.message} {...form.register('comment')} />
        {form.formState.errors.root && <p className="mt-3 text-sm text-red-600">{form.formState.errors.root.message}</p>}
        <AppButton type="submit" size="lg" className="mt-6" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</AppButton>
      </form>
    </PageShell>
  )
}
