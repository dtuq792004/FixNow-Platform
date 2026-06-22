import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, ImagePlus, LoaderCircle, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { AppPagination } from '../../../shared/components/AppPagination'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { formatCurrency } from '../../../shared/utils/format'
import { useConfirm } from '../../../shared/store/confirmStore'
import { serviceService } from '../../service/services/serviceService'
import { ProviderPageHeader } from '../components/ProviderPageHeader'
import { providerKeys } from '../hooks/useProvider'
import { providerService, type ServicePayload } from '../services/providerService'
import type { ProviderService } from '../types/providerTypes'

const schema = z.object({
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  name: z.string().trim().min(3, 'Tên dịch vụ cần ít nhất 3 ký tự'),
  description: z.string().trim().optional(),
  price: z.number().min(0, 'Giá không được nhỏ hơn 0'),
  unit: z.enum(['hour', 'job']),
  image: z.array(z.string().url()).max(5, 'Chỉ được tải tối đa 5 ảnh'),
})

export function ProviderServicesPage() {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<ProviderService | null | undefined>(undefined)
  const servicesQuery = useQuery({ queryKey: providerKeys.services, queryFn: providerService.getServices })
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: serviceService.getCategories })
  const saveMutation = useMutation({
    mutationFn: (payload: ServicePayload) => editing ? providerService.updateService(editing._id, payload) : providerService.createService(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: providerKeys.services }); setEditing(undefined) },
  })
  const deleteMutation = useMutation({
    mutationFn: providerService.deleteService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.services }),
  })
  const services = useMemo(() => (servicesQuery.data ?? []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [servicesQuery.data, search])
  const totalPages = Math.ceil(services.length / 9)
  const visibleServices = services.slice((page - 1) * 9, page * 9)

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <ProviderPageHeader title="Quản lý dịch vụ" description="Thêm, sửa và gửi duyệt dịch vụ của provider." action={<AppButton onClick={() => setEditing(null)}><Plus size={18} /> Thêm dịch vụ</AppButton>} />
    <div className="relative max-w-md"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4" placeholder="Tìm dịch vụ..." /></div>
    {servicesQuery.isLoading ? <div className="grid gap-4 md:grid-cols-3"><AppSkeleton /><AppSkeleton /><AppSkeleton /></div>
      : servicesQuery.isError ? <ErrorState />
      : services.length === 0 ? <EmptyState message="Chưa có dịch vụ nào." />
      : <><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleServices.map((service) => <article key={service._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <ServiceImage service={service} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase text-blue-600">{typeof service.categoryId === 'object' ? service.categoryId.name : 'Danh mục'}</p><h2 className="mt-1 truncate text-lg font-bold">{service.name}</h2></div><span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${service.status === 'APPROVED' ? 'bg-green-100 text-green-700' : service.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{service.status}</span></div>
          <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-500">{service.description || 'Chưa có mô tả'}</p>
          <p className="mt-4 font-bold text-blue-700">{service.price > 0 ? `${formatCurrency(service.price)}/${service.unit === 'hour' ? 'giờ' : 'công việc'}` : 'Báo giá khi sửa chữa'}</p>
          <div className="mt-5 flex border-t pt-3"><button className="flex flex-1 items-center justify-center gap-2" onClick={() => setEditing(service)}><Edit3 size={16} /> Sửa</button><button disabled={deleteMutation.isPending} className="flex flex-1 items-center justify-center gap-2 text-red-600" onClick={async () => { const confirmed = await confirm({ title: 'Xóa dịch vụ này?', description: `Dịch vụ “${service.name}” sẽ bị xóa và không còn hiển thị với khách hàng.`, confirmLabel: 'Xóa dịch vụ', variant: 'danger' }); if (confirmed) deleteMutation.mutate(service._id) }}><Trash2 size={16} /> Xóa</button></div>
        </div>
      </article>)}</div><AppPagination page={page} totalPages={totalPages} onPageChange={setPage} /></>}
    {editing !== undefined && <ServiceDialog service={editing} categories={categoriesQuery.data ?? []} pending={saveMutation.isPending} error={saveMutation.error?.message} onClose={() => setEditing(undefined)} onSubmit={(payload) => saveMutation.mutate(payload)} />}
  </div>
}

function ServiceDialog({ service, categories, pending, error, onClose, onSubmit }: { service: ProviderService | null; categories: Array<{ _id: string; name: string }>; pending: boolean; error?: string; onClose: () => void; onSubmit: (payload: ServicePayload) => void }) {
  const initialImages = Array.isArray(service?.image) ? service.image : service?.image ? [service.image] : []
  const form = useForm<ServicePayload>({ resolver: zodResolver(schema), defaultValues: { categoryId: typeof service?.categoryId === 'object' ? service.categoryId._id : service?.categoryId ?? '', name: service?.name ?? '', description: service?.description ?? '', price: service?.price ?? 0, unit: service?.unit ?? 'job', image: initialImages } })
  const images = useWatch({ control: form.control, name: 'image' }) ?? []
  const uploadMutation = useMutation({ mutationFn: providerService.uploadServiceImage, onSuccess: (url) => form.setValue('image', [...images, url], { shouldValidate: true }) })
  const isPending = pending || uploadMutation.isPending

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true"><div className="flex min-h-full items-start justify-center sm:items-center"><form onSubmit={form.handleSubmit(onSubmit)} className="my-3 flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-slate-50 shadow-[0_32px_100px_-24px_rgba(15,23,42,0.8)] sm:my-0 sm:max-h-[calc(100vh-3rem)]">
    <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-5 py-5 text-white sm:px-7 sm:py-6">
      <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-cyan-200/20 blur-xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur"><Sparkles size={21} /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">FixNow Service</p><h2 className="mt-1 text-xl font-extrabold sm:text-2xl">{service ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</h2><p className="mt-1 text-sm text-blue-100">Tạo hồ sơ dịch vụ nổi bật để khách hàng dễ dàng lựa chọn.</p></div>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20" aria-label="Đóng"><X size={20} /></button>
      </div>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-cyan-50/70 to-white p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4"><p className="font-bold text-slate-900">Bộ ảnh dịch vụ</p><p className="mt-1 text-xs leading-5 text-slate-500">Ảnh rõ nét giúp khách hàng hiểu công việc và tăng độ tin cậy.</p></div>
          <Field label="" error={form.formState.errors.image?.message || uploadMutation.error?.message}>
            <div className="grid grid-cols-2 gap-3">
              {images.map((url, index) => <div key={url} className={`group relative overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${index === 0 ? 'col-span-2 aspect-[16/8] border-blue-400' : 'aspect-[4/3] border-white'}`}><img src={url} alt={`Ảnh dịch vụ ${index + 1}`} className="h-full w-full object-cover" />{index === 0 && <span className="absolute bottom-2 left-2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">Ảnh đại diện</span>}<button type="button" aria-label="Xóa ảnh" onClick={() => form.setValue('image', images.filter((item) => item !== url), { shouldValidate: true })} className="absolute right-2 top-2 rounded-xl bg-slate-950/70 p-2 text-white shadow-lg opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"><X size={15} /></button></div>)}
              {images.length < 5 && <label className={`${images.length === 0 ? 'col-span-2 aspect-[16/8]' : 'aspect-[4/3]'} flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white/80 text-center text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:bg-white hover:shadow-md`}><input type="file" accept="image/*" className="hidden" disabled={uploadMutation.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadMutation.mutate(file); event.target.value = '' }} /><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">{uploadMutation.isPending ? <LoaderCircle className="animate-spin" size={23} /> : <ImagePlus size={23} />}</span><span className="mt-2 text-xs font-bold">{uploadMutation.isPending ? 'Đang tải ảnh...' : images.length ? 'Thêm ảnh khác' : 'Chọn ảnh dịch vụ'}</span></label>}
            </div>
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-normal leading-5 text-slate-500">Tối đa 5 ảnh. Ảnh đầu tiên sẽ xuất hiện trên card dịch vụ.</p>
          </Field>
        </section>
        <section className="space-y-5 bg-white p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="mb-4 text-sm font-bold text-slate-900">Thông tin cơ bản</p>
            <div className="space-y-4">
              <Field label="Danh mục" error={form.formState.errors.categoryId?.message}><select {...form.register('categoryId')} className="profile-input bg-white"><option value="">Chọn danh mục</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field>
              <Field label="Tên dịch vụ" error={form.formState.errors.name?.message}><input {...form.register('name')} className="profile-input bg-white" placeholder="Ví dụ: Sửa chữa điều hòa tại nhà" /></Field>
              <Field label="Mô tả"><textarea {...form.register('description')} className="profile-input h-auto resize-none bg-white py-3" rows={4} placeholder="Mô tả phạm vi công việc, kinh nghiệm và điểm nổi bật..." /></Field>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="mb-4 text-sm font-bold text-slate-900">Chi phí dịch vụ</p>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Mức giá (nhập 0 nếu báo giá sau)" error={form.formState.errors.price?.message}><input type="number" min="0" {...form.register('price', { valueAsNumber: true })} className="profile-input bg-white" placeholder="0" /></Field><Field label="Đơn vị tính"><select {...form.register('unit')} className="profile-input bg-white"><option value="job">Theo công việc</option><option value="hour">Theo giờ</option></select></Field></div>
          </div>
          {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
        </section>
      </div>
    </div>
    <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><p className="hidden text-xs text-slate-400 sm:block">Dịch vụ mới sẽ được FixNow kiểm duyệt trước khi hiển thị.</p><div className="flex flex-col-reverse gap-3 sm:flex-row"><AppButton type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy bỏ</AppButton><AppButton type="submit" disabled={isPending} className="shadow-lg shadow-blue-600/20">{pending ? 'Đang lưu...' : service ? 'Lưu thay đổi' : 'Tạo dịch vụ'}</AppButton></div></div>
  </form></div></div>
}

function ServiceImage({ service }: { service: ProviderService }) {
  const images = Array.isArray(service.image) ? service.image : service.image ? [service.image] : []
  return images[0]
    ? <img src={images[0]} alt={service.name} className="aspect-[16/9] w-full bg-slate-100 object-cover" />
    : <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-blue-300"><ImagePlus size={38} /></div>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}<span className="mt-2 block">{children}</span>{error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}</label>
}
