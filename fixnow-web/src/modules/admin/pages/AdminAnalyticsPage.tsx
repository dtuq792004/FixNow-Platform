import { ArrowRight, BookOpenText, Globe, HandCoins, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '../components/AdminUi'

const reports = [
  {
    to: '/admin/analytics/traffic',
    title: 'Lưu lượng web',
    description: 'Khách truy cập, lượt xem trang, tỷ lệ thoát, nguồn giới thiệu và thiết bị theo thời gian thực.',
    icon: Globe,
    tone: 'bg-cyan-50 text-cyan-600',
  },
  {
    to: '/admin/analytics/blog-views',
    title: 'Lượt xem blog',
    description: 'Theo dõi lượt đọc từng ngày trong tuần và các bài viết được quan tâm nhất.',
    icon: BookOpenText,
    tone: 'bg-violet-50 text-violet-600',
  },
  {
    to: '/admin/analytics/revenue',
    title: 'Doanh thu hệ thống',
    description: 'Phân tích tổng giao dịch và phần doanh thu nền tảng theo từng ngày.',
    icon: HandCoins,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    to: '/admin/analytics/catalog',
    title: 'Danh mục & dịch vụ',
    description: 'Thống kê quy mô danh mục, dịch vụ và trạng thái kiểm duyệt.',
    icon: Layers3,
    tone: 'bg-blue-50 text-blue-600',
  },
]

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Phân tích & báo cáo" description="Chọn nhóm dữ liệu cần theo dõi từ hệ thống." />
      <section className="grid gap-5 lg:grid-cols-3">
        {reports.map(({ to, title, description, icon: Icon, tone }) => (
          <Link key={to} to={to} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}><Icon size={23} /></span>
            <h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{description}</p>
            <span className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600">Xem báo cáo <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>
    </div>
  )
}
