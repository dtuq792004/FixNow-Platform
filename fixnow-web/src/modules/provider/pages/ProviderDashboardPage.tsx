import { useQuery } from '@tanstack/react-query'
import { BriefcaseBusiness, CircleDollarSign, Clock3, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { formatCurrency } from '../../../shared/utils/format'
import { ProviderCard } from '../components/ProviderPageHeader'
import { ProviderRevenueChart } from '../components/ProviderRevenueChart'
import { providerKeys, useAvailableJobs, useProviderJobs } from '../hooks/useProvider'
import { providerService } from '../services/providerService'

export function ProviderDashboardPage() {
  const { isOnline } = useOutletContext<{ isOnline: boolean }>()
  const [revenueRange, setRevenueRange] = useState<'day' | 'month' | 'year'>('day')
  const jobsQuery = useProviderJobs()
  const availableQuery = useAvailableJobs()
  const walletQuery = useQuery({ queryKey: providerKeys.wallet, queryFn: providerService.getWallet })
  const feedbackQuery = useQuery({ queryKey: providerKeys.feedbacks, queryFn: () => providerService.getFeedbacks(1, 100) })
  const revenueQuery = useQuery({
    queryKey: providerKeys.revenue(revenueRange),
    queryFn: () => providerService.getRevenue(revenueRange),
  })
  const loading = jobsQuery.isLoading || availableQuery.isLoading || walletQuery.isLoading || feedbackQuery.isLoading
  const error = jobsQuery.isError || availableQuery.isError || walletQuery.isError || feedbackQuery.isError
  const jobs = jobsQuery.data ?? []
  const ratings = (feedbackQuery.data?.docs ?? []).flatMap((item) => item.servicesFeedbacks.map((feedback) => feedback.rating))
  const average = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0
  if (loading) return <div className="mx-auto max-w-7xl space-y-4 p-6"><AppSkeleton /><AppSkeleton /></div>
  if (error) return <div className="mx-auto max-w-7xl p-6"><ErrorState /></div>
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-7 text-white"><p className="text-sm font-semibold">{isOnline ? 'ĐANG TRỰC TUYẾN' : 'ĐANG NGOẠI TUYẾN'}</p><h1 className="mt-2 text-3xl font-bold">Tổng quan hoạt động provider</h1><p className="mt-2 text-blue-50">Số liệu được tổng hợp từ đơn việc, ví và đánh giá hiện tại.</p></section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={<CircleDollarSign />} label="Số dư khả dụng" value={formatCurrency(walletQuery.data?.balance)} />
      <Stat icon={<Clock3 />} label="Yêu cầu mới" value={String(availableQuery.data?.length ?? 0)} />
      <Stat icon={<BriefcaseBusiness />} label="Đơn đang làm" value={String(jobs.filter((item) => item.status === 'IN_PROGRESS').length)} />
      <Stat icon={<Star />} label="Điểm đánh giá" value={average.toFixed(1)} />
    </div>
    <div className="grid items-stretch gap-5 xl:grid-cols-3">
      <div className="min-w-0 xl:col-span-2">
        <ProviderRevenueChart
          data={revenueQuery.data ?? []}
          range={revenueRange}
          onRangeChange={setRevenueRange}
          loading={revenueQuery.isLoading}
          error={revenueQuery.isError}
        />
      </div>
      <ProviderCard className="min-w-0 overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b p-5">
          <div>
            <h2 className="font-bold">Hoạt động gần đây</h2>
            <p className="text-sm text-slate-500">Các đơn được cập nhật mới nhất</p>
          </div>
          <Link to="/provider/jobs" className="shrink-0 text-sm font-semibold text-blue-600">Xem tất cả</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3.5">Dịch vụ</th>
                <th className="p-3.5 text-right">Thu nhập</th>
                <th className="p-3.5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {jobs.slice(0, 5).map((job) => (
                <tr key={job._id} className="border-t border-slate-100">
                  <td className="max-w-40 p-3.5 font-semibold text-slate-800">
                    <span className="line-clamp-2">{job.title || job.categoryId?.name}</span>
                  </td>
                  <td className="whitespace-nowrap p-3.5 text-right font-medium">
                    {formatCurrency(job.finalPrice || job.totalPrice)}
                  </td>
                  <td className="whitespace-nowrap p-3.5 text-right">
                    <StatusBadge status={job.status} />
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-400">
                    Chưa có hoạt động gần đây.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ProviderCard>
    </div>
  </div>
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <ProviderCard className="p-5"><span className="text-blue-600">{icon}</span><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></ProviderCard>
}
