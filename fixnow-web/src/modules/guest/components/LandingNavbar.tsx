import { Link, NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Dịch vụ', to: '/services' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Cẩm nang', to: '/blog' },
  { label: 'Hỗ trợ', to: '/support' },
]

function MaterialIcon({ children, className = '' }: { children: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-header-gradient shadow-md">
      <div className="mx-auto flex h-16 w-full max-w-container-max items-center justify-between px-gutter">
        <div className="flex items-center gap-xl">
          <Link className="text-headline-md font-extrabold tracking-tight text-white" to="/">
            FixNow
          </Link>

          <nav className="hidden items-center gap-lg md:flex" aria-label="Điều hướng chính">
            {navigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? 'border-b-2 border-white pb-1 text-sm font-bold text-white'
                    : 'text-sm font-medium text-white/80 transition-colors hover:text-white'
                }
                end={item.to === '/'}
                key={item.label}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-sm md:gap-md">
          <label className="hidden items-center rounded-full bg-white/20 px-md py-xs border border-white/10 lg:flex">
            <MaterialIcon className="text-white/70">search</MaterialIcon>
            <span className="sr-only">Tìm dịch vụ</span>
            <input
              className="w-48 border-none bg-transparent text-label-md outline-none text-white placeholder:text-white/60"
              placeholder="Tìm dịch vụ..."
              type="search"
            />
          </label>

          <Link
            className="rounded-full border border-white/30 px-md py-sm text-label-md font-semibold text-white transition-colors hover:bg-white/10 md:px-lg"
            to="/auth/login"
          >
            Đăng nhập
          </Link>
          <Link
            className="rounded-full bg-white px-md py-sm text-label-md font-bold text-primary transition-all hover:bg-white/90 active:scale-95 md:px-lg"
            to="/auth/signup"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  )
}
