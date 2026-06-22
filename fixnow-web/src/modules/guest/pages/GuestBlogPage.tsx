import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Clock3, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminPagination } from '../../admin/components/AdminUi'
import { blogService } from '../../admin/services/blogService'
import { GuestPageLayout } from '../components/GuestPageLayout'

const hero = 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1800&q=85'
const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value)) : ''

export function GuestBlogPage() {
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId') || ''
  const serviceName = searchParams.get('serviceName') || ''
  const filterKey = `${categoryId}:${serviceName}`
  const [pagination, setPagination] = useState({ page: 1, filterKey })
  const page = pagination.filterKey === filterKey ? pagination.page : 1
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['public', 'blogs', page, search, categoryId, serviceName],
    queryFn: () => blogService.listPublic({ page, limit: 9, search, categoryId, serviceName }),
  })

  return (
    <GuestPageLayout>
      <section className="relative flex min-h-[420px] items-center overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 text-white sm:px-8">
          <span className="inline-block rounded-full bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest">Cẩm nang FIXNOW</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Chăm sóc ngôi nhà dễ dàng hơn mỗi ngày</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Kinh nghiệm sửa chữa, bảo trì và mẹo sử dụng thiết bị an toàn từ đội ngũ FIXNOW.</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        {serviceName && (
          <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Đang xem cẩm nang</p>
              <h2 className="mt-1 text-lg font-black text-slate-900">{serviceName}</h2>
            </div>
            <Link to="/blog" className="shrink-0 text-sm font-bold text-blue-700 hover:underline">Xem tất cả</Link>
          </div>
        )}
        <label className="relative mx-auto block max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPagination({ page: 1, filterKey }) }} className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" placeholder="Tìm kiếm cẩm nang, mẹo hay..." />
        </label>
        {query.isLoading ? <div className="py-20 text-center text-slate-500">Đang tải bài viết...</div> : query.error || !query.data ? (
          <div className="py-20 text-center font-bold text-red-600">Không thể tải danh sách bài viết.</div>
        ) : query.data.items.length === 0 ? (
          <div className="py-20 text-center text-slate-500">Chưa có bài viết phù hợp.</div>
        ) : (
          <>
            <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {query.data.items.map((blog) => (
                <Link to={`/blog/${blog.slug}`} key={blog._id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={blog.coverImage.url} alt={blog.coverImage.alt || blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    {blog.isFeatured && <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950">Nổi bật</span>}
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">{blog.category}</p>
                    <h2 className="mt-3 line-clamp-2 text-xl font-black leading-snug text-slate-950 group-hover:text-blue-700">{blog.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{blog.excerpt}</p>
                    <div className="mt-5 flex items-center border-t border-slate-100 pt-4 text-xs text-slate-400">
                      <span>{formatDate(blog.publishedAt)}</span>
                      <span className="ml-3 flex items-center gap-1"><Clock3 size={14} />{blog.readTimeMinutes} phút</span>
                      <ArrowRight className="ml-auto text-blue-600 transition group-hover:translate-x-1" size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <AdminPagination {...query.data} onPageChange={(nextPage) => { setPagination({ page: nextPage, filterKey }); window.scrollTo({ top: 420, behavior: 'smooth' }) }} />
            </div>
          </>
        )}
      </section>
    </GuestPageLayout>
  )
}
