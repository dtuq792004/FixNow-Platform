import { useQuery } from '@tanstack/react-query'
import { HandCoins, ShoppingCart, TrendingUp, UserRoundCheck, Users, Wrench } from 'lucide-react'
import { useState } from 'react'
import { adminService } from '../services/adminService'
import { AdminBadge, AdminError, AdminLoading, AdminPageHeader, AdminStatCard } from '../components/AdminUi'

const money = (value = 0) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

const moneyShort = (value = 0) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}T`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

const statusLabel: Record<string, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xử lý',
  ACCEPTED: 'Đã tiếp nhận',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

const statusTone = (status: string, requestType?: string): 'green' | 'red' | 'amber' | 'blue' | 'slate' => {
  if (status === 'COMPLETED') return 'green'
  if (status === 'CANCELLED') return 'red'
  if (status === 'IN_PROGRESS') return 'blue'
  if (status === 'ACCEPTED') return 'blue'
  if (requestType === 'URGENT') return 'red'
  return 'amber'
}

function RevenueChart({ data }: { data: { _id: string; value: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const maxRevenue = Math.max(...data.map((d) => d.value), 1)

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    label: moneyShort(Math.round(maxRevenue * ratio)),
  }))

  const formatDate = (id: string) => {
    // id format: YYYY-MM-DD
    const parts = id.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`
    return id
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Tooltip */}
      {hovered !== null && (
        <div
          className="pointer-events-none absolute z-20 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl"
          style={{ top: 0, left: `${(hovered / data.length) * 100}%`, transform: 'translateX(-50%)' }}
        >
          <p className="text-xs font-semibold text-slate-500">{formatDate(data[hovered]._id)}</p>
          <p className="text-sm font-extrabold text-blue-600">{money(data[hovered].value)}</p>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-3">
        {/* Y-axis labels */}
        <div className="flex w-14 shrink-0 flex-col-reverse justify-between pb-6 text-right">
          {yTicks.map((tick) => (
            <span key={tick.ratio} className="text-[10px] leading-none text-slate-400">
              {tick.label}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Grid lines + Bars */}
          <div className="relative min-h-0 flex-1">
            {yTicks.map((tick) => (
              <div
                key={tick.ratio}
                className="absolute inset-x-0 border-t border-dashed border-slate-100"
                style={{ bottom: `${tick.ratio * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end gap-1.5 px-0.5">
              {data.map((item, i) => {
                const heightPct = Math.max(2, (item.value / maxRevenue) * 100)
                const isHovered = hovered === i
                return (
                  <div
                    key={item._id}
                    className="group relative flex flex-1 cursor-pointer flex-col items-center justify-end"
                    style={{ height: '100%' }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div
                      className="w-full rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${heightPct}%`,
                        background: isHovered
                          ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)'
                          : 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
                        boxShadow: isHovered ? '0 0 0 2px #bfdbfe, 0 4px 12px rgba(59,130,246,0.35)' : undefined,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="mt-1.5 flex gap-1.5 border-t border-slate-200 pt-2 px-0.5">
            {data.map((item, i) => (
              <div key={item._id} className="flex-1 text-center">
                <span
                  className={`text-[10px] font-medium transition-colors ${hovered === i ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  {formatDate(item._id)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminService.getDashboard,
  })

  if (isLoading)
    return (
      <div className="p-8">
        <AdminLoading />
      </div>
    )
  if (error || !data)
    return (
      <div className="p-8">
        <AdminError />
      </div>
    )

  const totalRevenue = data.revenueByDay.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Tổng quan hệ thống" description="Dữ liệu vận hành mới nhất của FixNow." />

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Tổng khách hàng" value={data.summary.totalUsers.toLocaleString('vi-VN')} icon={Users} />
        <AdminStatCard
          label="Provider"
          value={data.summary.totalProviders.toLocaleString('vi-VN')}
          icon={UserRoundCheck}
          tone="purple"
        />
        <AdminStatCard
          label="Yêu cầu dịch vụ"
          value={data.summary.totalRequests.toLocaleString('vi-VN')}
          icon={ShoppingCart}
          tone="amber"
        />
        <AdminStatCard
          label="Doanh thu nền tảng"
          value={money(data.summary.platformRevenue)}
          icon={HandCoins}
          tone="green"
        />
        <AdminStatCard
          label="Đang chờ xử lý"
          value={data.summary.pendingRequests.toLocaleString('vi-VN')}
          icon={Wrench}
          tone="red"
        />
      </section>

      {/* Chart + Recent requests */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Revenue chart */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Doanh thu 7 ngày gần nhất</h2>
              <p className="mt-0.5 text-xs text-slate-400">Doanh thu nền tảng theo từng ngày</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <TrendingUp size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-700">Tổng: {money(totalRevenue)}</span>
            </div>
          </div>

          {data.revenueByDay.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm text-slate-400">Chưa có dữ liệu doanh thu</p>
              </div>
            </div>
          ) : (
            <RevenueChart data={data.revenueByDay} />
          )}
        </div>

        {/* Recent requests */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Yêu cầu mới</h2>
            <p className="mt-0.5 text-xs text-slate-400">{data.latestRequests.length} yêu cầu gần nhất</p>
          </div>
          <div className="space-y-3">
            {data.latestRequests.map((item) => (
              <div
                key={item._id}
                className="group rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all hover:border-blue-100 hover:bg-blue-50/40"
              >
                <p className="truncate text-sm font-bold text-slate-900">
                  {item.title || item.services?.[0]?.name || 'Yêu cầu dịch vụ'}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{item.customerId?.fullName}</p>
                <div className="mt-2">
                  <AdminBadge tone={statusTone(item.status, item.requestType)}>
                    {statusLabel[item.status] || item.status}
                  </AdminBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top providers */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">Provider nổi bật</h2>
          <p className="mt-0.5 text-xs text-slate-400">Xếp hạng theo doanh thu và hiệu suất</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['#', 'Provider', 'Danh mục', 'Hoàn thành', 'Doanh thu'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topProviders.map((item, i) => (
                <tr key={item._id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${i === 0
                        ? 'bg-amber-100 text-amber-700'
                        : i === 1
                          ? 'bg-slate-100 text-slate-600'
                          : i === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {item.category || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{item.completed}</span>
                      <span className="text-xs text-slate-400">đơn</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-green-700">{money(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
