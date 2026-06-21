import {
  ArrowRight,
  CalendarClock,
  Check,
  Headphones,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { cn } from '../../../shared/utils/cn'

type PaymentResultPageProps = {
  result: 'success' | 'cancel'
}

const resultContent = {
  success: {
    eyebrow: 'Thanh toán đã được tiếp nhận',
    title: 'Cảm ơn bạn đã thanh toán!',
    description:
      'PayOS đã gửi kết quả về FixNow. Hệ thống đang xác nhận giao dịch và sẽ cập nhật đơn dịch vụ của bạn ngay sau đó.',
    notice: 'Giao dịch được bảo vệ và xác thực an toàn qua PayOS.',
    primaryLabel: 'Xem lịch sử dịch vụ',
    primaryHref: '/customer/history',
    secondaryLabel: 'Về trang chủ',
    secondaryHref: '/customer/home',
    accent: 'success',
  },
  cancel: {
    eyebrow: 'Giao dịch chưa hoàn tất',
    title: 'Bạn đã hủy thanh toán',
    description:
      'Không có khoản tiền nào được ghi nhận cho giao dịch này. Đơn dịch vụ vẫn được lưu để bạn có thể kiểm tra và thanh toán lại khi sẵn sàng.',
    notice: 'Bạn có thể mở lại đơn trong lịch sử dịch vụ để tiếp tục thanh toán.',
    primaryLabel: 'Kiểm tra đơn dịch vụ',
    primaryHref: '/customer/history',
    secondaryLabel: 'Liên hệ hỗ trợ',
    secondaryHref: '/support',
    accent: 'cancel',
  },
} as const

export function PaymentResultPage({ result }: PaymentResultPageProps) {
  const [searchParams] = useSearchParams()
  const content = resultContent[result]
  const isSuccess = result === 'success'
  const orderCode = searchParams.get('orderCode')
  const transactionCode = searchParams.get('code')

  return (
    <main className="payment-result-page relative isolate min-h-screen overflow-hidden bg-slate-950 px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={cn(
            'absolute -top-28 left-[8%] h-80 w-80 rounded-full blur-3xl',
            isSuccess ? 'bg-emerald-400/20' : 'bg-amber-400/16',
          )}
        />
        <div className="absolute -right-24 top-[28%] h-96 w-96 rounded-full bg-blue-500/22 blur-3xl" />
        <div className="absolute -bottom-40 left-[30%] h-96 w-96 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="payment-result-grid absolute inset-0 opacity-35" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col sm:min-h-[calc(100vh-5rem)]">
        <header className="flex items-center justify-between">
          <Link className="flex items-center gap-3 text-white" to="/">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg font-black text-blue-600 shadow-lg shadow-blue-950/30">
              F
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight">FixNow</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Service platform
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur sm:flex">
            <LockKeyhole size={14} className="text-cyan-300" />
            Kết nối được bảo mật
          </div>
        </header>

        <section className="payment-result-enter my-auto grid items-center gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
          <div className="max-w-2xl">
            <div
              className={cn(
                'mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]',
                isSuccess
                  ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-300'
                  : 'border-amber-300/20 bg-amber-300/10 text-amber-200',
              )}
            >
              <Sparkles size={15} />
              {content.eyebrow}
            </div>

            <div
              className={cn(
                'payment-result-icon mb-7 grid h-24 w-24 place-items-center rounded-[2rem] border shadow-2xl',
                isSuccess
                  ? 'border-emerald-300/30 bg-emerald-400 text-emerald-950 shadow-emerald-500/20'
                  : 'border-amber-200/30 bg-amber-300 text-amber-950 shadow-amber-500/20',
              )}
            >
              {isSuccess ? <Check size={48} strokeWidth={3} /> : <X size={48} strokeWidth={3} />}
            </div>

            <h1 className="max-w-xl text-4xl font-black leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppButton asChild size="lg" className="group min-w-52">
                <Link to={content.primaryHref}>
                  {content.primaryLabel}
                  <ArrowRight
                    className="transition-transform group-hover:translate-x-1"
                    size={18}
                  />
                </Link>
              </AppButton>
              <AppButton
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <Link to={content.secondaryHref}>{content.secondaryLabel}</Link>
              </AppButton>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
            <div
              className={cn(
                'absolute inset-x-0 top-0 h-1',
                isSuccess
                  ? 'bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500'
                  : 'bg-gradient-to-r from-amber-300 via-orange-400 to-blue-500',
              )}
            />

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Thông tin giao dịch
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {isSuccess ? 'Đang xác nhận' : 'Chưa thanh toán'}
                </h2>
              </div>
              <span
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                  isSuccess
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'bg-amber-300/15 text-amber-200',
                )}
              >
                <ReceiptText size={22} />
              </span>
            </div>

            <div className="my-6 h-px bg-white/10" />

            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Mã đơn PayOS</dt>
                <dd className="max-w-[60%] truncate font-mono font-semibold text-white">
                  {orderCode || 'Đang cập nhật'}
                </dd>
              </div>
              {transactionCode && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-400">Mã phản hồi</dt>
                  <dd className="font-mono font-semibold text-white">{transactionCode}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Cổng thanh toán</dt>
                <dd className="font-semibold text-white">PayOS</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Trạng thái</dt>
                <dd
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold',
                    isSuccess
                      ? 'bg-emerald-400/15 text-emerald-300'
                      : 'bg-amber-300/15 text-amber-200',
                  )}
                >
                  {isSuccess ? 'Đang xử lý' : 'Đã hủy'}
                </dd>
              </div>
            </dl>

            <div
              className={cn(
                'mt-6 flex gap-3 rounded-2xl border p-4 text-sm leading-6',
                isSuccess
                  ? 'border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-100'
                  : 'border-amber-200/15 bg-amber-200/[0.07] text-amber-100',
              )}
            >
              {isSuccess ? (
                <ShieldCheck className="mt-0.5 shrink-0" size={20} />
              ) : (
                <CalendarClock className="mt-0.5 shrink-0" size={20} />
              )}
              <span>{content.notice}</span>
            </div>
          </aside>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} FixNow. Nền tảng dịch vụ tận nơi.</span>
          <Link className="inline-flex items-center gap-2 text-slate-400 transition hover:text-white" to="/support">
            <Headphones size={15} />
            Cần hỗ trợ về giao dịch?
          </Link>
        </footer>
      </div>
    </main>
  )
}
