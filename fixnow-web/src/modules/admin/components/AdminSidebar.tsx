import {
  BarChart3,
  BookOpenText,
  Boxes,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Star,
  Users,
  WalletCards,
  Wrench,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../auth/hooks/useAuth'
import { cn } from '../../../shared/utils/cn'

type NavItem = { to: string; label: string; icon: LucideIcon }

const navItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/providers', label: 'Hồ sơ Provider', icon: ShieldCheck },
  { to: '/admin/categories', label: 'Danh mục', icon: Boxes },
  { to: '/admin/services', label: 'Dịch vụ Provider', icon: Wrench },
  { to: '/admin/transactions', label: 'Thanh toán', icon: CreditCard },
  { to: '/admin/withdrawals', label: 'Yêu cầu rút tiền', icon: WalletCards },
  { to: '/admin/reviews', label: 'Đánh giá', icon: Star },
  { to: '/admin/complaints', label: 'Khiếu nại', icon: MessageSquareWarning },
  { to: '/admin/analytics', label: 'Phân tích & báo cáo', icon: BarChart3 },
  { to: '/admin/blogs', label: 'Cẩm nang & Blog', icon: BookOpenText },
  { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
]

export function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()

  const logout = async () => {
    await logoutMutation.mutateAsync().catch(() => undefined)
    navigate('/auth/login', { replace: true })
  }

  return (
    <>
      {isOpen && <button type="button" className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden" aria-label="Đóng menu" onClick={onClose} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-cyan-300/15 bg-gradient-to-b from-[#062b63] via-[#0756a8] to-[#0891b2] text-blue-50 shadow-2xl shadow-blue-950/25 transition-transform lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex h-[72px] items-center border-b border-white/10 px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white shadow-lg shadow-blue-950/25 ring-1 ring-white/15"><Wrench size={20} /></span>
          <div className="ml-3">
            <p className="text-xl font-extrabold tracking-tight text-white">FixNow</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/75">Admin portal</p>
          </div>
          <button type="button" className="ml-auto rounded-lg p-2 text-blue-100 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} aria-label="Đóng menu"><X size={20} /></button>
        </div>

        <div className="px-5 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/65">Quản lý hệ thống</div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-blue-100/80 transition hover:bg-white/10 hover:text-white',
                isActive && 'bg-white/20 font-semibold text-white shadow-lg shadow-blue-950/20 ring-1 ring-white/15 hover:bg-white/25',
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button type="button" onClick={logout} disabled={logoutMutation.isPending} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-blue-100/80 transition hover:bg-red-500/20 hover:text-white">
            <LogOut size={18} />{logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </aside>
    </>
  )
}
