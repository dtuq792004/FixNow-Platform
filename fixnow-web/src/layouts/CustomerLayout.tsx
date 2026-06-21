import {
  Bell,
  CalendarDays,
  Headphones,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  UserRound,
  Wrench,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useLogoutMutation } from '../modules/auth/hooks/useAuth'
import { AppButton } from '../shared/components/AppButton'
import { cn } from '../shared/utils/cn'
import { useAuthStore } from '../modules/auth/store/authStore'
import { requestKeys } from '../modules/request/hooks/useRequests'
import { getAuthenticatedSocket } from '../shared/services/socketClient'

const navItems = [
  { to: '/customer/home', label: 'Trang chủ' },
  { to: '/customer/request/new', label: 'Dịch vụ' },
  { to: '/customer/history', label: 'Lịch hẹn' },
  { to: '/customer/chat', label: 'Hỗ trợ' },
]

export function CustomerLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const logoutMutation = useLogoutMutation()

  useEffect(() => {
    if (!accessToken) return
    const socket = getAuthenticatedSocket(accessToken)
    const handleRequestUpdated = (payload: { requestId?: string }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      if (payload.requestId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.detail(payload.requestId) })
      }
    }

    socket.on('request:updated', handleRequestUpdated)
    return () => {
      socket.off('request:updated', handleRequestUpdated)
    }
  }, [accessToken, queryClient])

  const logout = async () => {
    await logoutMutation.mutateAsync().catch(() => undefined)
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-40 bg-header-gradient shadow-md">
        <div className="mx-auto flex h-17 max-w-7xl items-center gap-5 px-4 sm:px-6">
          <NavLink to="/customer/home" className="text-2xl font-extrabold tracking-tight text-white">FixNow</NavLink>
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'border-b-2 border-transparent py-5 text-sm font-medium text-white/80 hover:text-white',
                    isActive && 'border-white text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden max-w-58 items-center gap-2 rounded-full bg-white/20 px-4 lg:flex border border-white/10">
            <Search size={17} className="text-white/70" />
            <input className="h-10 min-w-0 bg-transparent text-sm outline-none text-white placeholder:text-white/60" placeholder="Tìm dịch vụ..." />
          </div>
          <button className="rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Thông báo">
            <Bell size={20} />
          </button>
          <button
            onClick={() => navigate('/customer/profile')}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label="Tài khoản"
          >
            <UserRound size={20} />
          </button>
          <button
            aria-label="Đăng xuất"
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            disabled={logoutMutation.isPending}
            onClick={logout}
          >
            <LogOut size={20} />
          </button>
          <AppButton className="hidden border border-white/20 bg-white/10 text-white hover:bg-white/20 lg:inline-flex" onClick={() => navigate('/customer/request/new')}>
            Đặt lịch ngay
          </AppButton>
          <button className="md:hidden text-white" aria-label="Mở menu"><Menu size={22} /></button>
        </div>
      </header>
      <main className="pb-22 md:pb-0"><Outlet /></main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-17 grid-cols-5 border-t border-slate-200 bg-white md:hidden">
        {[
          ['/customer/home', Home, 'Trang chủ'],
          ['/customer/request/new', Wrench, 'Dịch vụ'],
          ['/customer/history', CalendarDays, 'Lịch hẹn'],
          ['/customer/chat', MessageCircle, 'Tin nhắn'],
          ['/customer/profile', UserRound, 'Cá nhân'],
        ].map(([to, Icon, label]) => (
          <NavLink
            key={to as string}
            to={to as string}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-[11px] text-slate-500',
                isActive && 'text-blue-600',
              )
            }
          >
            <Icon size={19} />
            {label as string}
          </NavLink>
        ))}
      </nav>
      <button
        className="fixed right-5 bottom-21 z-30 rounded-full bg-header-gradient p-4 text-white shadow-2xl md:bottom-7 active:scale-95 transition-transform"
        aria-label="Hỗ trợ nhanh"
      >
        <Headphones size={22} />
      </button>
    </div>
  )
}
import { useQueryClient } from '@tanstack/react-query'
