import {
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Star,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '../../auth/hooks/useAuth'
import { useAuthStore } from '../../auth/store/authStore'
import { cn } from '../../../shared/utils/cn'

type ProviderSidebarProps = {
  isOpen: boolean
  isOnline: boolean
  onClose: () => void
  onToggleOnline: () => void
  isStatusPending?: boolean
}

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/provider/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/provider/jobs', label: 'Đơn việc', icon: BriefcaseBusiness },
  { to: '/provider/services', label: 'Dịch vụ', icon: Wrench },
  { to: '/provider/wallet', label: 'Ví', icon: CircleDollarSign },
  { to: '/provider/reviews', label: 'Đánh giá', icon: Star },
  { to: '/provider/messages', label: 'Tin nhắn', icon: MessageCircle },
  { to: '/provider/notifications', label: 'Thông báo', icon: Bell },
  { to: '/provider/profile', label: 'Hồ sơ', icon: UserRound },
]

export function ProviderSidebar({
  isOpen,
  isOnline,
  onClose,
  onToggleOnline,
  isStatusPending = false,
}: ProviderSidebarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogoutMutation()
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || 'P'

  const logout = async () => {
    await logoutMutation.mutateAsync().catch(() => undefined)
    navigate('/auth/login', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
          aria-label="Đóng menu"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-50 flex w-68 flex-col border-r border-slate-200 bg-white pt-16 shadow-xl transition-transform duration-300 lg:z-30 lg:translate-x-0 lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Đóng menu"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{user?.fullName || 'Đối tác FixNow'}</p>
              <p className="mt-0.5 text-xs font-semibold text-blue-600">Đối tác ưu tú</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-600 transition',
                  'hover:bg-slate-100 hover:text-slate-900',
                  isActive && 'bg-blue-50 font-semibold text-blue-700',
                )
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}</p>
              <p className="text-xs text-slate-500">Nhận đơn việc mới</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isOnline}
              onClick={onToggleOnline}
              disabled={isStatusPending}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                isOnline ? 'bg-green-500' : 'bg-slate-300',
              )}
            >
              <span
                className={cn(
                  'absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  isOnline ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={logoutMutation.isPending}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut size={19} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  )
}
