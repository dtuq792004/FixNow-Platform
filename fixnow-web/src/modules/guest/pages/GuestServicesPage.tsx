import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { formatCurrency } from '../../../shared/utils/format'
import { useCategoriesQuery, useServicesQuery } from '../../service/hooks/useServices'
import { GuestPageLayout } from '../components/GuestPageLayout'

export function GuestServicesPage() {
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState('')
  const categoriesQuery = useCategoriesQuery()
  const servicesQuery = useServicesQuery(categoryId || undefined)
  const book = () => navigate('/auth/login', { state: { redirectTo: '/customer/request/new' } })

  return (
    <GuestPageLayout>
      <div className="mx-auto w-full max-w-container-max px-lg py-xl">
        <section className="mb-xxl flex min-h-64 items-center overflow-hidden rounded-xl bg-primary-container px-xl py-xl md:px-xxl">
          <div className="max-w-2xl"><h1 className="mb-sm text-headline-lg font-bold text-on-primary-container">Dịch vụ sửa chữa tại nhà</h1><p className="text-body-lg text-on-primary-container/80">Danh sách dịch vụ và mức giá được tải trực tiếp từ hệ thống FIXNOW.</p></div>
        </section>
        {categoriesQuery.isError && <ErrorState message={categoriesQuery.error.message} />}
        <div className="mb-lg flex gap-sm overflow-x-auto pb-xs">
          <button onClick={() => setCategoryId('')} className={`whitespace-nowrap rounded-full border px-lg py-sm text-label-md ${!categoryId ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-white'}`}>Tất cả</button>
          {categoriesQuery.data?.map((category) => <button key={category._id} onClick={() => setCategoryId(category._id)} className={`whitespace-nowrap rounded-full border px-lg py-sm text-label-md ${categoryId === category._id ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-white'}`}>{category.name}</button>)}
        </div>
        {servicesQuery.isPending && <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3"><AppSkeleton /><AppSkeleton /><AppSkeleton /></div>}
        {servicesQuery.isError && <ErrorState message={servicesQuery.error.message} />}
        {!servicesQuery.isPending && !servicesQuery.data?.length && <EmptyState message="Chưa có dịch vụ được duyệt trong danh mục này." />}
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {servicesQuery.data?.map((service) => {
            const image = service.image?.[0]
            const category = typeof service.categoryId === 'object' ? service.categoryId.name : 'Dịch vụ'
            return <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-white transition-all hover:shadow-lg" key={service._id}>{image ? <img src={image} alt={service.name} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-primary-container text-5xl text-primary">🛠️</div>}<div className="flex flex-grow flex-col p-lg"><span className="text-label-sm text-primary">{category}</span><h2 className="mt-xs text-title-lg font-semibold">{service.name}</h2><p className="my-lg flex-grow text-body-md text-on-surface-variant">{service.description || 'Dịch vụ tại nhà do provider FIXNOW cung cấp.'}</p><div className="flex items-end justify-between gap-md"><strong className="text-lg font-bold text-primary">{service.price > 0 ? formatCurrency(service.price) : 'Báo giá khi sửa chữa'}</strong><button className="shrink-0 rounded-xl bg-primary px-lg py-sm text-label-md text-white" onClick={book}>Đặt lịch</button></div></div></article>
          })}
        </div>
      </div>
    </GuestPageLayout>
  )
}
