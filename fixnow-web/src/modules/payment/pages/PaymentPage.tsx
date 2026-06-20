import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { PageShell } from '../../../shared/components/PageShell'
import { formatCurrency } from '../../../shared/utils/format'
import { useRequestQuery } from '../../request/hooks/useRequests'
import { paymentService } from '../services/paymentService'

export function PaymentPage() {
  const { requestId } = useParams()
  const requestQuery = useRequestQuery(requestId)
  const [promoCode, setPromoCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (requestQuery.isPending) return <PageShell title="Thanh toán" description="Đang tải đơn hàng..."><AppSkeleton /></PageShell>
  if (requestQuery.isError || !requestQuery.data) return <PageShell title="Thanh toán" description="Không thể tải đơn hàng."><ErrorState message={requestQuery.error?.message} /></PageShell>
  const request = requestQuery.data

  const checkout = async () => {
    if (!requestId) return
    setLoading(true)
    setError('')
    try {
      const response = await paymentService.createCheckout(requestId, promoCode || undefined)
      window.location.assign(response.checkoutUrl)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Không thể tạo phiên thanh toán')
      setLoading(false)
    }
  }

  return (
    <PageShell title="Thanh toán" description={`Hoàn tất thanh toán cho yêu cầu #${request._id.slice(-8).toUpperCase()}.`}>
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold">Tóm tắt đơn hàng</h2>
        <div className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Dịch vụ</span><b>{request.title || 'Yêu cầu dịch vụ'}</b></div><div className="flex justify-between"><span className="text-slate-500">Tổng tiền</span><b className="text-lg text-blue-600">{formatCurrency(request.finalPrice)}</b></div></div>
        <div className="mt-5 flex rounded-xl border border-slate-200 p-1"><input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} className="min-w-0 flex-1 px-3 text-sm outline-none" placeholder="Nhập mã giảm giá" /></div>
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-700"><ShieldCheck size={22} /><span>Thanh toán bảo mật qua PayOS.</span></div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <AppButton size="lg" className="mt-5 w-full" onClick={checkout} disabled={loading || request.finalPrice <= 0}>{loading ? 'Đang chuyển hướng...' : `Thanh toán ${formatCurrency(request.finalPrice)}`}</AppButton>
      </div>
    </PageShell>
  )
}
