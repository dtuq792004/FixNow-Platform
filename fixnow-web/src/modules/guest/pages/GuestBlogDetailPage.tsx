import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { BlogArticle } from '../../admin/components/BlogArticle'
import { blogService } from '../../admin/services/blogService'
import { GuestPageLayout } from '../components/GuestPageLayout'
import { BlogReviewForm } from '../components/BlogReviewForm'

export function GuestBlogDetailPage() {
  const { slug = '' } = useParams()
  const query = useQuery({ queryKey: ['public', 'blog', slug], queryFn: () => blogService.getPublic(slug), enabled: Boolean(slug) })

  return (
    <GuestPageLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"><ArrowLeft size={18} />Tất cả cẩm nang</Link>
        {query.isLoading ? <div className="py-24 text-center text-slate-500">Đang tải bài viết...</div> : query.error || !query.data ? (
          <div className="rounded-2xl bg-red-50 p-8 text-center font-bold text-red-700">Bài viết không tồn tại hoặc chưa được xuất bản.</div>
        ) : (
          <>
            <BlogArticle blog={query.data} />
            <BlogReviewForm slug={slug} />
          </>
        )}
      </div>
    </GuestPageLayout>
  )
}
