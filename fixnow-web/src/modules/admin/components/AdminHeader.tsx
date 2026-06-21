import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useAuthStore } from '../../auth/store/authStore'

type AdminHeaderProps = {
  onOpenSidebar: () => void
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const user = useAuthStore((state) => state.user)
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || 'A'

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[72px] border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 backdrop-blur-xl lg:left-[264px]">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Mở menu quản trị"
          onClick={onOpenSidebar}
        >
          <Menu size={22} />
        </button>

        <label className="relative hidden w-full max-w-[420px] sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            placeholder="Tìm kiếm trong hệ thống..."
          />
        </label>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button type="button" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600" aria-label="Thông báo">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <button type="button" className="flex items-center gap-3 rounded-xl px-1.5 py-1 hover:bg-slate-50 sm:pr-3">
            {user?.avatar ? (
              <img className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200" src={user.avatar} alt={user.fullName} />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-extrabold text-white shadow-sm">{initial}</span>
            )}
            <span className="hidden min-w-0 text-left md:block">
              <span className="block max-w-40 truncate text-sm font-bold text-slate-800">{user?.fullName || 'Quản trị viên'}</span>
              <span className="block text-xs font-medium text-slate-400">Administrator</span>
            </span>
            <ChevronDown size={16} className="hidden text-slate-400 md:block" />
          </button>
        </div>
      </div>
    </header>
  )
}
