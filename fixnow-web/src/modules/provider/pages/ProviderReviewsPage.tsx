import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquareReply, Star } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { AppPagination } from '../../../shared/components/AppPagination'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { formatDateTime } from '../../../shared/utils/format'
import { ProviderCard, ProviderPageHeader } from '../components/ProviderPageHeader'
import { providerKeys } from '../hooks/useProvider'
import { providerService } from '../services/providerService'
import type { ProviderFeedback } from '../types/providerTypes'

const schema = z.object({ reply: z.string().trim().min(5, 'Phản hồi cần ít nhất 5 ký tự').max(300) })

export function ProviderReviewsPage() {
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: [...providerKeys.feedbacks, page],
    queryFn: () => providerService.getFeedbacks(page, 10),
  })
  const reviews = query.data?.docs ?? []
  const ratings = reviews.flatMap((item) => item.servicesFeedbacks.map((feedback) => feedback.rating))
  const average = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
    <ProviderPageHeader title="Đánh giá từ khách hàng" description="Theo dõi đánh giá và phản hồi mới nhất từ khách hàng trên FixNow." />
    <div className="grid gap-4 sm:grid-cols-3"><ProviderCard className="p-5"><p className="text-sm text-slate-500">Điểm trung bình trang này</p><p className="mt-2 text-3xl font-black text-blue-600">{average.toFixed(1)}</p></ProviderCard><ProviderCard className="p-5"><p className="text-sm text-slate-500">Tổng lượt đánh giá</p><p className="mt-2 text-3xl font-black">{query.data?.totalDocs ?? 0}</p></ProviderCard><ProviderCard className="p-5"><p className="text-sm text-slate-500">Đã phản hồi trang này</p><p className="mt-2 text-3xl font-black">{reviews.filter((item) => item.providerReply).length}</p></ProviderCard></div>
    {query.isLoading ? <><AppSkeleton /><AppSkeleton /></> : query.isError ? <ErrorState /> : reviews.length === 0 ? <EmptyState message="Chưa có đánh giá." /> : <>
      <div className="space-y-4">{reviews.map((review) => <ReviewCard key={review._id} review={review} />)}</div>
      <AppPagination page={query.data?.page ?? page} totalPages={query.data?.totalPages ?? 0} onPageChange={setPage} />
    </>}
  </div>
}

function ReviewCard({ review }: { review: ProviderFeedback }) {
  const queryClient = useQueryClient()
  const [replying, setReplying] = useState(false)
  const form = useForm<{ reply: string }>({ resolver: zodResolver(schema), defaultValues: { reply: '' } })
  const mutation = useMutation({
    mutationFn: ({ reply }: { reply: string }) => providerService.replyFeedback(review._id, reply),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: providerKeys.feedbacks }); setReplying(false); form.reset() },
  })
  const rating = review.servicesFeedbacks.length ? review.servicesFeedbacks.reduce((sum, item) => sum + item.rating, 0) / review.servicesFeedbacks.length : 0
  const comments = review.servicesFeedbacks.map((item) => item.comment).filter(Boolean)
  return <ProviderCard className="p-5">
    <div className="flex justify-between gap-3"><div><h2 className="font-bold">{review.customerId?.fullName || 'Khách hàng'}</h2><div className="mt-1 flex">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} className={index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}</div></div><time className="text-xs text-slate-400">{formatDateTime(review.createdAt)}</time></div>
    <p className="mt-4 text-sm leading-6 text-slate-600">{comments.join(' · ') || 'Khách hàng không để lại bình luận.'}</p>
    {review.providerReply ? <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm"><b className="text-blue-700">Phản hồi của bạn</b><p className="mt-2">{review.providerReply}</p></div>
      : replying ? <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="mt-4"><textarea {...form.register('reply')} rows={3} className="profile-input h-auto py-3" /><p className="mt-1 text-xs text-red-600">{form.formState.errors.reply?.message}</p><div className="mt-3 flex gap-2"><AppButton type="submit" disabled={mutation.isPending}>Gửi phản hồi</AppButton><AppButton type="button" variant="ghost" onClick={() => setReplying(false)}>Hủy</AppButton></div></form>
      : <AppButton variant="outline" className="mt-4" onClick={() => setReplying(true)}><MessageSquareReply size={17} /> Phản hồi</AppButton>}
  </ProviderCard>
}
