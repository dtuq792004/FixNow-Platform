import { cn } from '../utils/cn'

type Status = 'AWAITING_PAYMENT' | 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'SUCCESS' | 'FAILED' | 'REFUNDED'

const styles: Record<Status, string> = {
  AWAITING_PAYMENT: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-slate-100 text-slate-600',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
}

const labels: Record<Status, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xác nhận',
  ACCEPTED: 'Đã tiếp nhận',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', styles[status])}>{labels[status]}</span>
}
