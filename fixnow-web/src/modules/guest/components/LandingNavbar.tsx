import { Boxes, CalendarDays, ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCategoriesQuery, useServicesQuery } from '../../service/hooks/useServices'
import { cn } from '../../../shared/utils/cn'

const navigationItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Dịch vụ', to: '/services' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Hỗ trợ', to: '/support' },
]

const bookingState = { redirectTo: '/customer/request/new' }

const blogUrl = (categoryId: string, serviceName: string) =>
  `/blog?categoryId=${encodeURIComponent(categoryId)}&serviceName=${encodeURIComponent(serviceName)}`

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [mobileGuideOpen, setMobileGuideOpen] = useState(false)
  const categoriesQuery = useCategoriesQuery()
  const servicesQuery = useServicesQuery()
  const categories = categoriesQuery.data ?? []
  const displayedCategoryId = activeCategoryId || categories[0]?._id || ''

  const servicesByCategory = useMemo(() => {
    const result = new Map<string, string[]>()
    for (const service of servicesQuery.data ?? []) {
      const categoryId = typeof service.categoryId === 'object' ? service.categoryId._id : service.categoryId
      if (!categoryId) continue
      const current = result.get(categoryId) ?? []
      if (!current.some((name) => name.localeCompare(service.name, 'vi', { sensitivity: 'base' }) === 0)) {
        current.push(service.name)
        current.sort((left, right) => left.localeCompare(right, 'vi'))
        result.set(categoryId, current)
      }
    }
    return result
  }, [servicesQuery.data])

  const closeMobileMenu = () => {
    setIsMenuOpen(false)
    setMobileGuideOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-header-gradient shadow-md">
      <div className="mx-auto flex min-h-16 w-full max-w-container-max items-center gap-3 px-4 py-2 sm:px-6 lg:px-gutter">
        <Link className="shrink-0 text-xl font-extrabold tracking-tight text-white sm:text-2xl" to="/">
          FixNow
        </Link>

        <nav className="ml-5 hidden items-center gap-5 lg:flex" aria-label="Điều hướng chính">
          {navigationItems.slice(0, 3).map((item) => (
            <NavigationLink key={item.label} {...item} />
          ))}

          <div className="group relative">
            <NavLink
              to="/blog"
              className={({ isActive }) => cn(
                'flex items-center gap-1 border-b-2 border-transparent py-5 text-sm font-medium text-white/80 transition-colors hover:text-white',
                isActive && 'border-white font-bold text-white',
              )}
            >
              Cẩm nang <ChevronDown size={15} className="transition group-hover:rotate-180" />
            </NavLink>

            <div className="invisible absolute left-1/2 top-full w-[570px] -translate-x-1/2 translate-y-2 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid min-h-60 grid-cols-[215px_1fr] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div className="bg-slate-50 p-2.5">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      type="button"
                      onMouseEnter={() => setActiveCategoryId(category._id)}
                      onFocus={() => setActiveCategoryId(category._id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition',
                        displayedCategoryId === category._id ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-blue-50 hover:text-blue-700',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border',
                            displayedCategoryId === category._id
                              ? 'border-white/25 bg-white/15'
                              : 'border-blue-100 bg-white',
                          )}
                        >
                          {category.iconUrl ? (
                            <img
                              src={category.iconUrl}
                              alt=""
                              className="h-5 w-5 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Boxes size={16} />
                          )}
                        </span>
                        <span className="truncate">{category.name}</span>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {servicesQuery.isLoading ? (
                    <p className="text-sm text-slate-500">Đang tải dịch vụ...</p>
                  ) : (servicesByCategory.get(displayedCategoryId) ?? []).length ? (
                    <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100">
                      {(servicesByCategory.get(displayedCategoryId) ?? []).map((serviceName) => (
                        <Link
                          key={serviceName}
                          to={blogUrl(displayedCategoryId, serviceName)}
                          className="block px-3 py-3 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          {serviceName}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Danh mục này chưa có dịch vụ được duyệt.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <NavigationLink {...navigationItems[3]} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-95 sm:px-5 sm:text-sm"
            state={bookingState}
            to="/auth/login"
          >
            <CalendarDays size={17} />
            <span className="hidden min-[390px]:inline">Đặt lịch ngay</span>
            <span className="min-[390px]:hidden">Đặt lịch</span>
          </Link>

          <Link className="hidden rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 md:inline-flex" to="/auth/login">
            Đăng nhập
          </Link>
          <Link className="hidden rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 md:inline-flex" to="/auth/signup">
            Đăng ký
          </Link>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-white/15 bg-blue-950/95 px-4 py-4 shadow-xl backdrop-blur lg:hidden">
          <nav className="mx-auto grid max-w-container-max gap-1" aria-label="Điều hướng di động">
            {navigationItems.slice(0, 3).map((item) => (
              <MobileNavigationLink key={item.label} {...item} onClick={closeMobileMenu} />
            ))}

            <button
              type="button"
              onClick={() => setMobileGuideOpen((open) => !open)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Cẩm nang
              <ChevronDown size={17} className={cn('transition', mobileGuideOpen && 'rotate-180')} />
            </button>
            {mobileGuideOpen && (
              <div className="space-y-2 rounded-xl bg-white/10 p-2">
                <Link to="/blog" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2.5 text-sm font-bold text-white">
                  Tất cả cẩm nang
                </Link>
                {categories.map((category) => (
                  <div key={category._id} className="rounded-lg bg-blue-950/40 p-2">
                    <button
                      type="button"
                      onClick={() => setActiveCategoryId(activeCategoryId === category._id ? '' : category._id)}
                      className="flex w-full items-center justify-between px-2 py-2 text-left text-sm font-bold text-blue-100"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10">
                          {category.iconUrl ? (
                            <img
                              src={category.iconUrl}
                              alt=""
                              className="h-6 w-6 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Boxes size={18} />
                          )}
                        </span>
                        <span className="truncate">{category.name}</span>
                      </span>
                      <ChevronDown size={16} className={cn('transition', activeCategoryId === category._id && 'rotate-180')} />
                    </button>
                    {activeCategoryId === category._id && (
                      <div className="mt-1 grid gap-1">
                        {(servicesByCategory.get(category._id) ?? []).map((serviceName) => (
                          <Link
                            key={serviceName}
                            to={blogUrl(category._id, serviceName)}
                            onClick={closeMobileMenu}
                            className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                          >
                            {serviceName}
                          </Link>
                        ))}
                        {!servicesQuery.isLoading && !(servicesByCategory.get(category._id) ?? []).length && (
                          <p className="px-3 py-2 text-xs text-white/55">Chưa có dịch vụ được duyệt.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <MobileNavigationLink {...navigationItems[3]} onClick={closeMobileMenu} />
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/15 pt-3 md:hidden">
              <Link className="rounded-xl border border-white/25 px-4 py-3 text-center text-sm font-bold text-white" onClick={closeMobileMenu} to="/auth/login">
                Đăng nhập
              </Link>
              <Link className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-blue-700" onClick={closeMobileMenu} to="/auth/signup">
                Đăng ký
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function NavigationLink({ label, to }: { label: string; to: string }) {
  return (
    <NavLink
      className={({ isActive }) => cn(
        'border-b-2 border-transparent py-5 text-sm font-medium text-white/80 transition-colors hover:text-white',
        isActive && 'border-white font-bold text-white',
      )}
      end={to === '/'}
      to={to}
    >
      {label}
    </NavLink>
  )
}

function MobileNavigationLink({ label, to, onClick }: { label: string; to: string; onClick: () => void }) {
  return (
    <NavLink
      className={({ isActive }) => cn(
        'rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white',
        isActive && 'bg-white/15 text-white',
      )}
      end={to === '/'}
      onClick={onClick}
      to={to}
    >
      {label}
    </NavLink>
  )
}
