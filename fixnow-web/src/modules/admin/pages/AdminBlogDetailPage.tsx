import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit3, ExternalLink, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminError, AdminLoading } from '../components/AdminUi'
import { BlogArticle } from '../components/BlogArticle'
import { blogService } from '../services/blogService'

export function AdminBlogDetailPage() {
  const { blogId = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin', 'blog', blogId], queryFn: () => blogService.getAdmin(blogId), enabled: Boolean(blogId) })
  const remove = useMutation({
    mutationFn: blogService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] })
      navigate('/admin/blogs')
    },
  })

  if (query.isLoading) return <div className="p-6 lg:p-8"><AdminLoading /></div>
  if (query.error || !query.data) return <div className="p-6 lg:p-8"><AdminError message="Không tìm thấy bài viết." /></div>

  const blog = query.data
  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/blogs" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"><ArrowLeft size={18} />Danh sách blog</Link>
        <div className="flex flex-wrap gap-2">
          {blog.status === 'PUBLISHED' && <Link to={`/blog/${blog.slug}`} target="_blank" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"><ExternalLink size={17} />Xem trang công khai</Link>}
          <Link to={`/admin/blogs/${blog._id}/edit`} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"><Edit3 size={17} />Chỉnh sửa</Link>
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => window.confirm(`Xóa bài viết "${blog.title}"?`) && remove.mutate(blog._id)}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600"
          >
            <Trash2 size={17} />Xóa
          </button>
        </div>
      </div>
      <BlogArticle blog={blog} />
    </div>
  )
}
