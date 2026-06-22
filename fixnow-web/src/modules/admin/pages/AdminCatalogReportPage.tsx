import { useQuery } from '@tanstack/react-query'
import { Boxes, CircleCheckBig, Layers3, Wrench } from 'lucide-react'
import { AdminError, AdminLoading, AdminPageHeader, AdminStatCard } from '../components/AdminUi'
import { HorizontalBarChart, ReportTabs, VerticalBarChart } from '../components/ReportComponents'
import { adminService } from '../services/adminService'

export function AdminCatalogReportPage() {
  const query = useQuery({ queryKey: ['admin', 'reports', 'catalog'], queryFn: adminService.getCatalogReport })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Thống kê danh mục & dịch vụ" description="Quy mô danh mục và trạng thái dịch vụ hiện có trên hệ thống." />
      <ReportTabs />
      {query.isLoading && <AdminLoading />}
      {query.error && <AdminError />}
      {query.data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Tổng danh mục" value={String(query.data.totalCategories)} icon={Boxes} />
            <AdminStatCard label="Danh mục hoạt động" value={String(query.data.activeCategories)} icon={Layers3} tone="purple" />
            <AdminStatCard label="Tổng dịch vụ" value={String(query.data.totalServices)} icon={Wrench} tone="amber" />
            <AdminStatCard label="Dịch vụ đã duyệt" value={String(query.data.approvedServices)} icon={CircleCheckBig} tone="green" />
          </section>
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-6 font-extrabold text-slate-900">Số dịch vụ theo danh mục</h2>
              {query.data.categories.length ? (
                <HorizontalBarChart items={query.data.categories.map((item) => ({ key: item._id, label: item.name, value: item.totalServices, secondary: `${item.approvedServices} đã duyệt` }))} />
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có danh mục trên hệ thống.</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-extrabold text-slate-900">Dịch vụ theo trạng thái</h2>
              <VerticalBarChart
                items={query.data.serviceStatuses.map((item) => ({ ...item, date: item.status }))}
                value={(item) => item.value}
                formatValue={(item) => item.value.toLocaleString('vi-VN')}
                color="bg-cyan-600"
              />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
