import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BadgeDollarSign, HandCoins, ReceiptText } from 'lucide-react'
import { AdminError, AdminLoading, AdminPageHeader, AdminStatCard } from '../components/AdminUi'
import { ReportTabs, VerticalBarChart, WeekNavigator } from '../components/ReportComponents'
import { adminService } from '../services/adminService'

const money = (value: number) => `${value.toLocaleString('vi-VN')} ₫`

export function AdminRevenueReportPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const query = useQuery({
    queryKey: ['admin', 'reports', 'revenue', weekOffset],
    queryFn: () => adminService.getRevenueReport(weekOffset),
  })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Thống kê doanh thu hệ thống" description="Dữ liệu lấy từ các giao dịch thanh toán thành công." />
      <ReportTabs />
      {query.isLoading && <AdminLoading />}
      {query.error && <AdminError />}
      {query.data && (
        <>
          <div className="flex justify-end">
            <WeekNavigator startDate={query.data.startDate} endDate={query.data.endDate} weekOffset={weekOffset} onChange={setWeekOffset} />
          </div>
          <section className="grid gap-4 sm:grid-cols-3">
            <AdminStatCard label="Tổng giá trị giao dịch" value={money(query.data.totalGrossRevenue)} icon={BadgeDollarSign} tone="green" />
            <AdminStatCard label="Doanh thu nền tảng" value={money(query.data.totalPlatformRevenue)} icon={HandCoins} />
            <AdminStatCard label="Giao dịch thành công" value={query.data.totalTransactions.toLocaleString('vi-VN')} icon={ReceiptText} tone="amber" />
          </section>
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-extrabold text-slate-900">Tổng giá trị giao dịch theo ngày</h2>
              <VerticalBarChart items={query.data.daily} value={(item) => item.grossRevenue} formatValue={(item) => money(item.grossRevenue)} color="bg-emerald-600" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-extrabold text-slate-900">Doanh thu nền tảng theo ngày</h2>
              <VerticalBarChart items={query.data.daily} value={(item) => item.platformRevenue} formatValue={(item) => money(item.platformRevenue)} color="bg-blue-600" />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
