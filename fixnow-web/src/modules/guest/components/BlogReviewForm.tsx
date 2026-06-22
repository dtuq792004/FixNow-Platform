import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquareText, Star } from 'lucide-react'
import { useState } from 'react'
import { blogService } from '../../admin/services/blogService'

export function BlogReviewForm({ slug }: { slug: string }) {
  const client = useQueryClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const reviewsQuery = useQuery({
    queryKey: ['public', 'blog-reviews', slug],
    queryFn: () => blogService.getReviews(slug),
  })
  const reviewMutation = useMutation({
    mutationFn: () => blogService.createReview(slug, { rating, comment }),
    onSuccess: (data) => {
      client.setQueryData(['public', 'blog-reviews', slug], data)
      setRating(0)
      setComment('')
      setMessage('Cảm ơn bạn đã đánh giá bài viết.')
    },
    onError: (error: Error) => setMessage(error.message),
  })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    if (!rating) return setMessage('Vui lòng chọn số sao đánh giá.')
    if (!comment.trim()) return setMessage('Vui lòng nhập nhận xét.')
    reviewMutation.mutate()
  }

  const summary = reviewsQuery.data

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 shadow-sm">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white"><MessageSquareText size={23} /></span>
          <h2 className="mt-5 text-2xl font-black text-slate-950">Bài viết này có hữu ích?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Đánh giá của bạn giúp FIXNOW cải thiện nội dung cẩm nang.</p>
          {summary && summary.totalReviews > 0 && (
            <div className="mt-6 rounded-2xl bg-white/80 p-4">
              <p className="text-3xl font-black text-blue-700">{summary.averageRating.toFixed(1)}<span className="text-base text-slate-400">/5</span></p>
              <div className="mt-2 flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((value) => <Star key={value} size={17} fill={value <= Math.round(summary.averageRating) ? 'currentColor' : 'none'} />)}
              </div>
              <p className="mt-2 text-xs text-slate-500">{summary.totalReviews} lượt đánh giá</p>
            </div>
          )}
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-extrabold text-slate-800">Mức độ hài lòng *</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} sao`}
                onClick={() => setRating(value)}
                className={`rounded-xl p-2 transition ${value <= rating ? 'bg-amber-50 text-amber-400' : 'text-slate-300 hover:bg-slate-50 hover:text-amber-300'}`}
              >
                <Star size={27} fill={value <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Nhận xét *</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Chia sẻ cảm nhận của bạn về bài viết..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>
          {message && <p className={`mt-3 text-sm font-semibold ${reviewMutation.isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
          <button type="submit" disabled={reviewMutation.isPending} className="mt-5 h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
            {reviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>
    </section>
  )
}
