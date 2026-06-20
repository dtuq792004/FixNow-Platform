import { Bell, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/authStore'

type ProviderNavbarProps = {
  onOpenSidebar: () => void
}

export function ProviderNavbar({ onOpenSidebar }: ProviderNavbarProps) {
  const user = useAuthStore((state) => state.user)
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || 'P'

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-full items-center px-4 sm:px-6">
        <button
          type="button"
          className="mr-3 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Mở menu"
          onClick={onOpenSidebar}
        >
          <Menu size={22} />
        </button>

        <Link to="/provider/dashboard" className="text-2xl font-extrabold tracking-tight text-blue-600">
          FixNow
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative rounded-full p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label="Thông báo"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <Link
            to="/provider/profile"
            className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50"
            aria-label="Mở hồ sơ"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-9 w-9 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {initial}
              </span>
            )}
            <span className="hidden text-left md:block">
              <span className="block max-w-40 truncate text-sm font-semibold text-slate-800">
                {user?.fullName || 'Đối tác FixNow'}
              </span>
              <span className="block text-xs text-slate-500">Nhà cung cấp</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
