import { Bell, CalendarCheck, CheckCircle2, CreditCard, MapPin, PackageOpen, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { useAuthStore } from '../../auth/store/authStore'
import { useMyRequestsQuery } from '../../request/hooks/useRequests'
import { useCategoriesQuery, useServicesQuery } from '../../service/hooks/useServices'
import { CategoryGrid } from '../components/CategoryGrid'
import { FeaturedProviders } from '../components/FeaturedProviders'
import { HomeSection } from '../components/HomeSection'
import { useCustomerNotificationsQuery, useFeaturedProvidersQuery } from '../hooks/useCustomerHome'

const activeStatuses = ['AWAITING_PAYMENT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS']

export function CustomerHomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const categoriesQuery = useCategoriesQuery()
  const servicesQuery = useServicesQuery()
  const requestsQuery = useMyRequestsQuery()
  const notificationsQuery = useCustomerNotificationsQuery()
  const providersQuery = useFeaturedProvidersQuery()
  const requests = requestsQuery.data ?? []
  const services = servicesQuery.data ?? []
  const notifications = notificationsQuery.data ?? []
  const stats = {
    total: requests.length,
    active: requests.filter((item) => activeStatuses.includes(item.status)).length,
    completed: requests.filter((item) => item.status === 'COMPLETED').length,
    spent: requests.filter((item) => item.status === 'COMPLETED').reduce((sum, item) => sum + item.finalPrice, 0),
  }
  const statCards: Array<{ icon: LucideIcon; value: string | number; label: string; color: string }> = [
    { icon: PackageOpen, value: stats.total, label: 'Tổng đơn', color: 'bg-blue-50 text-blue-600' },
    { icon: CalendarCheck, value: stats.active, label: 'Đang thực hiện', color: 'bg-amber-50 text-amber-600' },
    { icon: CheckCircle2, value: stats.completed, label: 'Đã hoàn thành', color: 'bg-green-50 text-green-600' },
    { icon: CreditCard, value: formatCurrency(stats.spent), label: 'Tổng chi tiêu', color: 'bg-violet-50 text-violet-600' },
  ]

  const bookCategory = (categoryId: string) => navigate(`/customer/request/new?categoryId=${categoryId}`)
  const bookService = (serviceId: string, categoryId?: string) => {
    const query = new URLSearchParams({ serviceId })
    if (categoryId) query.set('categoryId', categoryId)
    navigate(`/customer/request/new?${query.toString()}`)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Xin chào, {user?.fullName ?? 'bạn'}!</h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">Chúc bạn một ngày tốt lành. Hôm nay FixNow có thể giúp gì cho bạn?</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <main className="min-w-0 space-y-9">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map(({ icon: Icon, value, label, color }) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
                <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={21} /></span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <strong className="mt-1 block text-xl text-slate-900">{value}</strong>
              </article>
            ))}
          </div>

          <HomeSection title="Danh mục phổ biến" action={<button onClick={() => navigate('/customer/request/new')} className="text-sm font-semibold text-blue-600 hover:underline">Xem tất cả</button>}>
            {categoriesQuery.isPending && <AppSkeleton />}
            {categoriesQuery.isError && <ErrorState message={categoriesQuery.error.message} />}
            {categoriesQuery.data && !categoriesQuery.data.length && <EmptyState message="Chưa có danh mục dịch vụ." />}
            {categoriesQuery.data && <CategoryGrid categories={categoriesQuery.data} onSelect={bookCategory} />}
          </HomeSection>

          <HomeSection title="Dịch vụ đề xuất">
            {servicesQuery.isPending && <AppSkeleton />}
            {servicesQuery.isError && <ErrorState message={servicesQuery.error.message} />}
            {!servicesQuery.isPending && !services.length && <EmptyState message="Chưa có dịch vụ đề xuất." />}
            <div className="grid gap-4 md:grid-cols-2">
              {services.slice(0, 2).map((service, index) => {
                const categoryId = typeof service.categoryId === 'object' ? service.categoryId._id : service.categoryId
                return (
                  <article key={service._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className={`relative flex h-40 items-center justify-center overflow-hidden ${index % 2 ? 'bg-cyan-50 text-cyan-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Wrench size={42} />
                      {service.image?.[0] && <img src={service.image[0]} alt={service.name} onError={(event) => event.currentTarget.classList.add('hidden')} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-1 text-lg font-bold group-hover:text-blue-600">{service.name}</h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{service.description || 'Dịch vụ sửa chữa tại nhà do FixNow cung cấp.'}</p>
                      <div className="mt-5 flex items-center justify-between gap-3"><strong className="text-lg text-blue-600">{formatCurrency(service.price)}</strong><AppButton size="sm" onClick={() => bookService(service._id, categoryId)}>Đặt ngay</AppButton></div>
                    </div>
                  </article>
                )
              })}
            </div>
          </HomeSection>

          <HomeSection title="Thợ nổi bật">
            {providersQuery.isPending && <AppSkeleton />}
            {providersQuery.isError && <ErrorState message={providersQuery.error.message} />}
            {providersQuery.data && !providersQuery.data.length && <EmptyState message="Chưa có thợ nổi bật." />}
            {providersQuery.data && <FeaturedProviders providers={providersQuery.data} />}
          </HomeSection>
        </main>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5"><h2 className="text-lg font-bold">Thông báo mới</h2><span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">{notifications.filter((item) => !item.isRead).length}</span></div>
            <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">
              {notificationsQuery.isPending && <AppSkeleton />}
              {notificationsQuery.isError && <ErrorState message={notificationsQuery.error.message} />}
              {!notificationsQuery.isPending && !notifications.length && <EmptyState message="Chưa có thông báo mới." />}
              {notifications.slice(0, 4).map((item) => <article key={item._id} className={`flex gap-3 rounded-xl border-l-4 p-3 ${item.isRead ? 'border-transparent' : 'border-blue-600 bg-blue-50/60'}`}><Bell size={19} className="mt-0.5 shrink-0 text-blue-600" /><div className="min-w-0"><h3 className="text-sm font-bold">{item.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.message}</p><time className="mt-1 block text-[11px] text-slate-400">{formatDateTime(item.createdAt)}</time></div></article>)}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold">Đơn hàng gần đây</h2></div>
            <div className="space-y-3 p-4">
              {requestsQuery.isPending && <AppSkeleton />}
              {requestsQuery.isError && <ErrorState message={requestsQuery.error.message} />}
              {!requestsQuery.isPending && !requests.length && <EmptyState message="Bạn chưa có đơn hàng." />}
              {requests.slice(0, 2).map((request) => (
                <article key={request._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-slate-400">#{request._id.slice(-8).toUpperCase()}</p><h3 className="mt-1 truncate font-bold">{request.title || 'Yêu cầu dịch vụ'}</h3></div><StatusBadge status={request.status} /></div>
                  <p className="mt-3 flex items-start gap-2 text-xs text-slate-500"><MapPin size={14} className="mt-0.5 shrink-0" /><span className="line-clamp-2">{request.addressText || 'Địa chỉ đã lưu'}</span></p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-400">{formatDateTime(request.startAt || request.createdAt)}</span><button onClick={() => navigate(`/customer/tracking/${request._id}`)} className="text-xs font-bold text-blue-600 hover:underline">Chi tiết</button></div>
                </article>
              ))}
              <button onClick={() => navigate('/customer/history')} className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50">Xem tất cả lịch sử đơn hàng</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
