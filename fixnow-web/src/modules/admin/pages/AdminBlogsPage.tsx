import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, Edit3, Eye, FileText, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminBadge, AdminError, AdminLoading, AdminPageHeader, AdminPagination, AdminToolbar } from '../components/AdminUi'
import { blogService } from '../services/blogService'
import type { BlogStatus } from '../types/blogTypes'

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value)) : 'Chưa xuất bản'

export function AdminBlogsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BlogStatus | ''>('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', 'blogs', page, search, status],
    queryFn: () => blogService.listAdmin({ page, limit: 9, search, status }),
  })
  const remove = useMutation({
    mutationFn: blogService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] }),
  })

  const deleteBlog = (id: string, title: string) => {
    if (window.confirm(`Xóa vĩnh viễn bài viết "${title}"?`)) remove.mutate(id)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Cẩm nang & Blog"
        description="Quản lý nội dung hướng dẫn, mẹo bảo trì và kiến thức dành cho người dùng FixNow."
        actions={
          <Link to="/admin/blogs/new" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
            <Plus size={18} />Tạo bài viết
          </Link>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <AdminToolbar
          placeholder="Tìm theo tiêu đề, mô tả, danh mục hoặc thẻ..."
          value={search}
          onChange={(value) => { setSearch(value); setPage(1) }}
        >
          <select
            value={status}
            onChange={(event) => { setStatus(event.target.value as BlogStatus | ''); setPage(1) }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
        </AdminToolbar>
        <div className="bg-slate-50/60 p-4 sm:p-6">
          {query.isLoading ? <AdminLoading /> : query.error || !query.data ? <AdminError /> : query.data.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <FileText className="mx-auto text-slate-300" size={42} />
              <p className="mt-3 font-bold text-slate-700">Không có bài viết phù hợp</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {query.data.items.map((blog) => (
                <article
                  key={blog._id}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => navigate(`/admin/blogs/${blog._id}`)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img src={blog.coverImage.url} alt={blog.coverImage.alt || blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute left-3 top-3 flex gap-2">
                      <AdminBadge tone={blog.status === 'PUBLISHED' ? 'green' : 'amber'}>{blog.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}</AdminBadge>
                      {blog.isFeatured && <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-amber-950"><Star size={12} fill="currentColor" />Nổi bật</span>}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-600">{blog.category}</p>
                    <h2 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-slate-950">{blog.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{blog.excerpt}</p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock3 size={14} />{blog.readTimeMinutes} phút</span>
                      <span className="flex items-center gap-1"><Eye size={14} />{blog.viewCount}</span>
                      <span className="ml-auto">{formatDate(blog.publishedAt)}</span>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/admin/blogs/${blog._id}/edit`) }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">
                        <Edit3 size={16} />Chỉnh sửa
                      </button>
                      <button type="button" disabled={remove.isPending} onClick={(event) => { event.stopPropagation(); deleteBlog(blog._id, blog.title) }} className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        {query.data && <AdminPagination {...query.data} onPageChange={setPage} />}
      </section>
    </div>
  )
}
