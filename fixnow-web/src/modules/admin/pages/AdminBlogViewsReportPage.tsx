import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpenText, Eye, TrendingUp } from 'lucide-react'
import { AdminError, AdminLoading, AdminPageHeader, AdminStatCard } from '../components/AdminUi'
import { HorizontalBarChart, ReportTabs, VerticalBarChart, WeekNavigator } from '../components/ReportComponents'
import { adminService } from '../services/adminService'

export function AdminBlogViewsReportPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const query = useQuery({
    queryKey: ['admin', 'reports', 'blog-views', weekOffset],
    queryFn: () => adminService.getBlogViewReport(weekOffset),
  })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Thống kê lượt xem blog" description="Mỗi cột biểu diễn tổng lượt xem trong một ngày." />
      <ReportTabs />
      {query.isLoading && <AdminLoading />}
      {query.error && <AdminError />}
      {query.data && (
        <>
          <div className="flex justify-end">
            <WeekNavigator startDate={query.data.startDate} endDate={query.data.endDate} weekOffset={weekOffset} onChange={setWeekOffset} />
          </div>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Tổng lượt xem toàn hệ thống" value={query.data.allTimeViews.toLocaleString('vi-VN')} icon={Eye} />
            <AdminStatCard label="Lượt xem trong tuần" value={query.data.totalViews.toLocaleString('vi-VN')} icon={Eye} />
            <AdminStatCard label="Bài viết đã xuất bản" value={query.data.publishedBlogs.toLocaleString('vi-VN')} icon={BookOpenText} tone="purple" />
            <AdminStatCard label="Trung bình mỗi ngày" value={Math.round(query.data.totalViews / 7).toLocaleString('vi-VN')} icon={TrendingUp} tone="green" />
          </section>
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-extrabold text-slate-900">Lượt xem theo ngày</h2>
              <VerticalBarChart items={query.data.daily} value={(item) => item.value} formatValue={(item) => item.value.toLocaleString('vi-VN')} color="bg-violet-600" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-6 font-extrabold text-slate-900">Bài viết được xem nhiều</h2>
              {query.data.topBlogs.length ? (
                <HorizontalBarChart items={query.data.topBlogs.map((item) => ({ key: item._id, label: item.title, value: item.views, secondary: 'lượt' }))} />
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có lượt xem được ghi nhận trong tuần này.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
