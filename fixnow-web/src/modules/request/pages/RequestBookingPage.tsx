import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, Check, Clock3, MapPin } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { AppTextarea } from '../../../shared/components/AppInput'
import { ErrorState } from '../../../shared/components/PageStates'
import { PageShell } from '../../../shared/components/PageShell'
import { formatCurrency } from '../../../shared/utils/format'
import { cn } from '../../../shared/utils/cn'
import { useAddressesQuery } from '../../profile/hooks/useAddresses'
import { useCategoriesQuery, useServicesQuery } from '../../service/hooks/useServices'
import {
  CategorySelectionCard,
  ServiceSelectionCard,
} from '../components/BookingSelectionCards'
import { useCreateRequestMutation } from '../hooks/useRequests'

const requestSchema = z.object({
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  serviceId: z.string().optional(),
  description: z.string().min(15, 'Mô tả cần ít nhất 15 ký tự'),
  addressId: z.string().min(1, 'Vui lòng chọn địa chỉ'),
  schedule: z.enum(['soon', 'scheduled']),
  startAt: z.string().optional(),
  terms: z.boolean().refine(Boolean, 'Bạn cần đồng ý với điều khoản dịch vụ'),
}).superRefine((data, context) => {
  if (data.schedule === 'scheduled' && !data.startAt) {
    context.addIssue({ code: 'custom', path: ['startAt'], message: 'Vui lòng chọn thời gian' })
  }
})

type RequestForm = z.infer<typeof requestSchema>

export function RequestBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCategoryId = searchParams.get('categoryId') ?? ''
  const initialServiceId = searchParams.get('serviceId') ?? ''
  const categoriesQuery = useCategoriesQuery()
  const addressesQuery = useAddressesQuery()
  const createMutation = useCreateRequestMutation()
  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { categoryId: initialCategoryId, serviceId: initialServiceId, addressId: '', schedule: 'soon', terms: false },
  })
  const categoryId = useWatch({ control: form.control, name: 'categoryId' })
  const serviceId = useWatch({ control: form.control, name: 'serviceId' })
  const addressId = useWatch({ control: form.control, name: 'addressId' })
  const schedule = useWatch({ control: form.control, name: 'schedule' })
  const servicesQuery = useServicesQuery(categoryId || undefined)
  const previousCategoryId = useRef(categoryId)

  useEffect(() => {
    if (!categoryId && categoriesQuery.data?.[0]) {
      form.setValue('categoryId', categoriesQuery.data[0]._id)
    }
  }, [categoriesQuery.data, categoryId, form])

  useEffect(() => {
    if (!addressId && addressesQuery.data?.length) {
      const selected = addressesQuery.data.find((address) => address.isDefault) ?? addressesQuery.data[0]
      form.setValue('addressId', selected._id)
    }
  }, [addressesQuery.data, addressId, form])

  useEffect(() => {
    if (previousCategoryId.current && previousCategoryId.current !== categoryId) {
      form.setValue('serviceId', '')
    }
    previousCategoryId.current = categoryId
  }, [categoryId, form])

  const selectedCategory = categoriesQuery.data?.find((item) => item._id === categoryId)
  const selectedService = servicesQuery.data?.find((item) => item._id === serviceId)

  const onSubmit = async (data: RequestForm) => {
    try {
      const response = await createMutation.mutateAsync({
        categoryId: data.categoryId,
        addressId: data.addressId,
        title: selectedService?.name ?? selectedCategory?.name ?? 'Yêu cầu dịch vụ',
        description: data.description,
        services: data.serviceId ? [data.serviceId] : undefined,
        startAt: data.schedule === 'scheduled' ? new Date(data.startAt as string).toISOString() : undefined,
      })
      if (response.checkoutUrl) {
        window.location.assign(response.checkoutUrl)
        return
      }
      navigate(`/customer/tracking/${response.data._id}`)
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'Không thể tạo yêu cầu' })
    }
  }

  const loading = categoriesQuery.isPending || addressesQuery.isPending
  if (loading) {
    return <PageShell title="Tạo yêu cầu dịch vụ" description="Đang tải dữ liệu thực tế..."><div className="h-64 animate-pulse rounded-2xl bg-slate-200" /></PageShell>
  }
  if (categoriesQuery.isError || addressesQuery.isError) {
    return <PageShell title="Tạo yêu cầu dịch vụ" description="Không thể chuẩn bị biểu mẫu."><ErrorState message={(categoriesQuery.error ?? addressesQuery.error)?.message} /></PageShell>
  }

  return (
    <PageShell title="Tạo yêu cầu dịch vụ" description="Chọn danh mục, địa chỉ và mô tả vấn đề cần xử lý.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-bold text-blue-600">1. Chọn danh mục</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categoriesQuery.data?.map((category) => (
                <CategorySelectionCard
                  key={category._id}
                  category={category}
                  selected={categoryId === category._id}
                  onSelect={() =>
                    form.setValue('categoryId', category._id, { shouldValidate: true })
                  }
                />
              ))}
            </div>
            {form.formState.errors.categoryId && <p className="mt-2 text-xs text-red-600">{form.formState.errors.categoryId.message}</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-bold text-blue-600">2. Chọn dịch vụ cụ thể (không bắt buộc)</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {servicesQuery.data?.map((service) => (
                <ServiceSelectionCard
                  key={service._id}
                  service={service}
                  selected={serviceId === service._id}
                  onSelect={() => form.setValue('serviceId', service._id)}
                />
              ))}
            </div>
            {!servicesQuery.isPending && !servicesQuery.data?.length && <p className="mt-4 text-sm text-slate-500">Danh mục này chưa có dịch vụ niêm yết; yêu cầu sẽ được gửi để provider báo giá.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="mb-5 text-lg font-bold text-blue-600">3. Mô tả sự cố</h2>
            <AppTextarea label="Mô tả chi tiết tình trạng" error={form.formState.errors.description?.message} {...form.register('description')} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-blue-600">4. Địa chỉ</h2><button type="button" onClick={() => navigate('/customer/addresses')} className="text-sm font-semibold text-blue-600">Quản lý địa chỉ</button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {addressesQuery.data?.map((address) => (
                <button key={address._id} type="button" onClick={() => form.setValue('addressId', address._id, { shouldValidate: true })} className={cn('flex items-start gap-3 rounded-xl border p-4 text-left', addressId === address._id ? 'border-blue-600 bg-blue-50' : 'border-slate-200')}>
                  <MapPin className="mt-0.5 text-blue-600" size={20} />
                  <span><b>{address.label}</b><span className="mt-1 block text-sm text-slate-500">{[address.addressLine, address.ward, address.district, address.city].filter(Boolean).join(', ')}</span></span>
                  {addressId === address._id && <Check className="ml-auto text-blue-600" size={19} />}
                </button>
              ))}
            </div>
            {!addressesQuery.data?.length && <p className="mt-4 text-sm text-red-600">Bạn cần thêm ít nhất một địa chỉ trước khi đặt dịch vụ.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-bold text-blue-600">5. Thời gian thực hiện</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[['soon', Clock3, 'Sớm nhất'], ['scheduled', CalendarDays, 'Đặt lịch']].map(([value, Icon, label]) => (
                <button key={value as string} type="button" onClick={() => form.setValue('schedule', value as 'soon' | 'scheduled')} className={cn('flex gap-3 rounded-xl border p-4 text-left', schedule === value ? 'border-blue-600 bg-blue-50' : 'border-slate-200')}>
                  <Icon className="text-blue-600" size={21} /><b>{label as string}</b>
                </button>
              ))}
            </div>
            {schedule === 'scheduled' && <input type="datetime-local" className="mt-4 w-full rounded-xl border border-slate-200 p-3" {...form.register('startAt')} />}
            {form.formState.errors.startAt && <p className="mt-2 text-xs text-red-600">{form.formState.errors.startAt.message}</p>}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Chi tiết yêu cầu</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Danh mục</dt><dd className="font-semibold">{selectedCategory?.name ?? 'Chưa chọn'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Dịch vụ</dt><dd className="text-right font-semibold">{selectedService?.name ?? 'Provider báo giá'}</dd></div>
            <div className="flex justify-between border-t pt-4 text-base"><dt className="font-bold">Tạm tính</dt><dd className="font-bold text-blue-600">{selectedService?.price ? formatCurrency(selectedService.price) : 'Chờ báo giá'}</dd></div>
          </dl>
          <label className="mt-5 flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 accent-blue-600" {...form.register('terms')} /><span>Tôi đồng ý với điều khoản dịch vụ của FixNow.</span></label>
          {form.formState.errors.terms && <p className="mt-2 text-xs text-red-600">{form.formState.errors.terms.message}</p>}
          {form.formState.errors.root && <p className="mt-3 text-sm text-red-600">{form.formState.errors.root.message}</p>}
          <AppButton type="submit" size="lg" className="mt-5 w-full" disabled={createMutation.isPending || !addressesQuery.data?.length}>
            {createMutation.isPending ? 'Đang tạo yêu cầu...' : selectedService?.price ? 'Tiếp tục thanh toán' : 'Gửi yêu cầu báo giá'}
          </AppButton>
        </aside>
      </form>
    </PageShell>
  )
}
