import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { WalletCards, X } from 'lucide-react'
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

export function ProviderWalletPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [withdrawPage, setWithdrawPage] = useState(1)
  const walletQuery = useQuery({ queryKey: providerKeys.wallet, queryFn: providerService.getWallet })
  const revenueQuery = useQuery({ queryKey: providerKeys.revenue('day'), queryFn: () => providerService.getRevenue('day') })
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
  const loading = walletQuery.isLoading || revenueQuery.isLoading || withdrawsQuery.isLoading
  const error = walletQuery.isError || revenueQuery.isError || withdrawsQuery.isError

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <ProviderPageHeader title="Quản lý ví & thu nhập" description="Theo dõi số dư, thu nhập và lịch sử rút tiền trên FixNow." action={<AppButton onClick={() => setOpen(true)} disabled={!wallet || wallet.balance < 500000}><WalletCards size={17} /> Rút tiền</AppButton>} />
    {loading ? <AppSkeleton /> : error || !wallet ? <ErrorState /> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Số dư khả dụng', wallet.balance], ['Đang chờ xử lý', wallet.pending], ['Tổng thu nhập', wallet.totalEarned], ['Đã rút', wallet.totalWithdrawn]].map(([label, value]) => <ProviderCard key={String(label)} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-blue-700">{formatCurrency(Number(value))}</p></ProviderCard>)}
      </div>
      <ProviderCard className="p-6"><h2 className="text-lg font-bold">Doanh thu theo ngày</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{revenueQuery.data?.slice(0, 9).map((point) => <div key={JSON.stringify(point._id)} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{[point._id.day, point._id.month, point._id.year].filter(Boolean).join('/')}</p><p className="mt-1 font-bold">{formatCurrency(point.totalRevenue)}</p><p className="text-xs text-slate-500">{point.totalOrders} đơn</p></div>)}</div></ProviderCard>
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
