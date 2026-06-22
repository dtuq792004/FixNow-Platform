import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight, WalletCards, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { AppPagination } from '../../../shared/components/AppPagination'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { ProviderCard, ProviderPageHeader } from '../components/ProviderPageHeader'
import { providerKeys } from '../hooks/useProvider'
import { providerService } from '../services/providerService'

const schema = z.object({
  amount: z.number().min(500000, 'Số tiền tối thiểu là 500.000 ₫'),
  bankName: z.string().trim().min(2, 'Nhập tên ngân hàng'),
  accountNumber: z.string().trim().min(6, 'Số tài khoản không hợp lệ'),
  accountHolder: z.string().trim().min(2, 'Nhập chủ tài khoản'),
})
type FormData = z.infer<typeof schema>

const startOfWeek = (value = new Date()) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  return date
}

const toDateParam = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatWeekRange = (weekStart: Date) => {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const formatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}`
}

export function ProviderWalletPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [withdrawPage, setWithdrawPage] = useState(1)
  const [selectedWeek, setSelectedWeek] = useState(() => startOfWeek())
  const currentWeek = startOfWeek()
  const weekParam = toDateParam(selectedWeek)
  const isCurrentWeek = weekParam === toDateParam(currentWeek)
  const walletQuery = useQuery({ queryKey: providerKeys.wallet, queryFn: providerService.getWallet })
  const revenueQuery = useQuery({
    queryKey: providerKeys.revenue('day', weekParam),
    queryFn: () => providerService.getRevenue('day', weekParam),
  })
  const withdrawsQuery = useQuery({ queryKey: providerKeys.withdraws, queryFn: providerService.getWithdraws })
  const mutation = useMutation({
    mutationFn: providerService.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.wallet })
      queryClient.invalidateQueries({ queryKey: providerKeys.withdraws })
      setOpen(false)
    },
  })
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { amount: 500000, bankName: '', accountNumber: '', accountHolder: '' } })
  const wallet = walletQuery.data
  const withdraws = withdrawsQuery.data ?? []
  const withdrawTotalPages = Math.ceil(withdraws.length / 10)
  const visibleWithdraws = withdraws.slice((withdrawPage - 1) * 10, withdrawPage * 10)
  const weeklyRevenue = revenueQuery.data?.reduce((sum, point) => sum + point.totalRevenue, 0) ?? 0
  const weeklyOrders = revenueQuery.data?.reduce((sum, point) => sum + point.totalOrders, 0) ?? 0
  const maxDailyRevenue = Math.max(...(revenueQuery.data?.map((point) => point.totalRevenue) ?? []), 1)
  const changeWeek = (offset: number) => {
    setSelectedWeek((current) => {
      const next = new Date(current)
      next.setDate(next.getDate() + offset * 7)
      return next
    })
  }
  const loading = walletQuery.isLoading || withdrawsQuery.isLoading
  const error = walletQuery.isError || withdrawsQuery.isError

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <ProviderPageHeader title="Quản lý ví & thu nhập" description="Theo dõi số dư, thu nhập và lịch sử rút tiền trên FixNow." action={<AppButton onClick={() => setOpen(true)} disabled={!wallet || wallet.balance < 500000}><WalletCards size={17} /> Rút tiền</AppButton>} />
    {loading ? <AppSkeleton /> : error || !wallet ? <ErrorState /> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Số dư khả dụng', wallet.balance], ['Đang chờ xử lý', wallet.pending], ['Tổng thu nhập', wallet.totalEarned], ['Đã rút', wallet.totalWithdrawn]].map(([label, value]) => <ProviderCard key={String(label)} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-blue-700">{formatCurrency(Number(value))}</p></ProviderCard>)}
      </div>
      <ProviderCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold">Doanh thu trong tuần</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">{formatWeekRange(selectedWeek)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => changeWeek(-1)} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Xem tuần trước"><ChevronLeft size={18} /></button>
            {!isCurrentWeek && <button type="button" onClick={() => setSelectedWeek(currentWeek)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Tuần hiện tại</button>}
            <button type="button" onClick={() => changeWeek(1)} disabled={isCurrentWeek} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Xem tuần sau"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Tổng doanh thu tuần</p><p className="mt-1 text-xl font-bold text-blue-800">{formatCurrency(weeklyRevenue)}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đơn hoàn thành</p><p className="mt-1 text-xl font-bold text-slate-800">{weeklyOrders} đơn</p></div>
        </div>

        {revenueQuery.isError ? <div className="mt-5"><ErrorState message="Không thể tải doanh thu của tuần này." /></div> : (
          <div className={`mt-6 grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-4 lg:grid-cols-7 ${revenueQuery.isFetching ? 'opacity-60' : ''}`}>
            {revenueQuery.data?.map((point, index) => {
              const date = new Date(point._id.year, (point._id.month ?? 1) - 1, point._id.day ?? 1)
              const height = point.totalRevenue ? Math.max(12, point.totalRevenue / maxDailyRevenue * 100) : 4
              return <div key={weekParam + index} className="flex min-h-48 flex-col rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">{new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date)}</p>
                <p className="mt-0.5 text-xs text-slate-400">{point.label}</p>
                <div className="my-3 flex h-20 items-end justify-center rounded-lg bg-white px-3">
                  <div className="w-full rounded-t-md bg-blue-500" style={{ height: `${height}%` }} />
                </div>
                <p className="mt-auto text-sm font-bold text-slate-800">{formatCurrency(point.totalRevenue)}</p>
                <p className="text-xs text-slate-500">{point.totalOrders} đơn</p>
              </div>
            })}
          </div>
        )}
      </ProviderCard>
      <ProviderCard className="overflow-hidden"><div className="border-b p-5"><h2 className="font-bold">Lịch sử rút tiền</h2></div>
        {!withdraws.length ? <EmptyState message="Chưa có yêu cầu rút tiền." /> : <><div className="overflow-x-auto"><table className="w-full min-w-160 text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Ngày</th><th className="p-4">Ngân hàng</th><th className="p-4">Số tiền</th><th className="p-4">Trạng thái</th></tr></thead><tbody>{visibleWithdraws.map((item) => <tr key={item._id} className="border-t"><td className="p-4">{formatDateTime(item.createdAt)}</td><td className="p-4">{item.bankName} · {item.accountNumber.slice(-4).padStart(item.accountNumber.length, '*')}</td><td className="p-4 font-bold">{formatCurrency(item.amount)}</td><td className="p-4"><StatusBadge status={item.status === 'APPROVED' ? 'SUCCESS' : item.status === 'REJECTED' ? 'FAILED' : 'PENDING'} /></td></tr>)}</tbody></table></div><div className="p-4"><AppPagination page={withdrawPage} totalPages={withdrawTotalPages} onPageChange={setWithdrawPage} /></div></>}
      </ProviderCard>
    </>}
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold text-slate-950">Rút tiền</h2><button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng"><X size={20} /></button></div>
      <p className="mt-4 text-sm text-slate-500">Khả dụng: <b>{formatCurrency(wallet?.balance)}</b></p>
      <div className="mt-5 space-y-4">{(['amount', 'bankName', 'accountNumber', 'accountHolder'] as const).map((name) => <label key={name} className="block text-sm font-semibold">{({ amount: 'Số tiền', bankName: 'Ngân hàng', accountNumber: 'Số tài khoản', accountHolder: 'Chủ tài khoản' })[name]}<input type={name === 'amount' ? 'number' : 'text'} {...form.register(name, name === 'amount' ? { valueAsNumber: true } : undefined)} className="profile-input mt-2" />{form.formState.errors[name] && <span className="mt-1 block text-xs text-red-600">{form.formState.errors[name]?.message}</span>}</label>)}</div>
      {mutation.isError && <p className="mt-3 text-sm text-red-600">{mutation.error.message}</p>}
      <AppButton type="submit" className="mt-5 w-full" disabled={mutation.isPending}>{mutation.isPending ? 'Đang gửi...' : 'Xác nhận rút tiền'}</AppButton>
    </form></div>}
  </div>
}
