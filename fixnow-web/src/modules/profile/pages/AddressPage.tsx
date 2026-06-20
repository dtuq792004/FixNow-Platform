import { zodResolver } from '@hookform/resolvers/zod'
import { Home, LocateFixed, MapPin, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { AppInput } from '../../../shared/components/AppInput'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { PageShell } from '../../../shared/components/PageShell'
import { useConfirm } from '../../../shared/store/confirmStore'
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from '../hooks/useAddresses'

const schema = z.object({
  label: z.string().min(1, 'Vui lòng nhập tên địa chỉ'),
  addressLine: z.string().min(3, 'Vui lòng nhập số nhà, tên đường'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  city: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean(),
})

type AddressForm = z.infer<typeof schema>

export function AddressPage() {
  const confirm = useConfirm()
  const [showForm, setShowForm] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const addressesQuery = useAddressesQuery()
  const createMutation = useCreateAddressMutation()
  const updateMutation = useUpdateAddressMutation()
  const deleteMutation = useDeleteAddressMutation()
  const form = useForm<AddressForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      addressLine: '',
      ward: '',
      district: '',
      city: '',
      isDefault: false,
    },
  })

  const locateAddress = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Trình duyệt không hỗ trợ định vị GPS.')
      return
    }

    setIsLocating(true)
    setLocationMessage(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue('latitude', position.coords.latitude, { shouldValidate: true })
        form.setValue('longitude', position.coords.longitude, { shouldValidate: true })
        setLocationMessage(`Đã lưu tọa độ · sai số khoảng ${Math.round(position.coords.accuracy)} m`)
        setIsLocating(false)
      },
      () => {
        setLocationMessage('Không thể lấy vị trí. Hãy kiểm tra quyền vị trí của trình duyệt.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000 },
    )
  }

  const submit = async (data: AddressForm) => {
    await createMutation.mutateAsync(data)
    form.reset()
    setLocationMessage(null)
    setShowForm(false)
  }

  return (
    <PageShell
      title="Quản lý địa chỉ"
      description="Lưu địa chỉ và tọa độ để đặt dịch vụ, theo dõi bản đồ chính xác hơn."
      action={
        <AppButton onClick={() => setShowForm((value) => !value)}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Đóng' : 'Thêm địa chỉ'}
        </AppButton>
      }
    >
      {showForm && (
        <form onSubmit={form.handleSubmit(submit)} className="mb-7 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AppInput label="Tên địa chỉ" error={form.formState.errors.label?.message} {...form.register('label')} />
            <AppInput label="Số nhà, tên đường" error={form.formState.errors.addressLine?.message} {...form.register('addressLine')} />
            <AppInput label="Phường/Xã" error={form.formState.errors.ward?.message} {...form.register('ward')} />
            <AppInput label="Quận/Huyện" error={form.formState.errors.district?.message} {...form.register('district')} />
            <AppInput label="Tỉnh/Thành phố" error={form.formState.errors.city?.message} {...form.register('city')} />
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <AppButton type="button" variant="outline" size="sm" onClick={locateAddress} disabled={isLocating}>
              <LocateFixed size={17} className={isLocating ? 'animate-pulse' : ''} />
              {isLocating ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
            </AppButton>
            <p className="mt-2 text-xs text-slate-600">
              {locationMessage ?? 'Tọa độ giúp Provider xem đúng vị trí của bạn trên bản đồ.'}
            </p>
          </div>
          <label className="mt-4 flex gap-2 text-sm">
            <input type="checkbox" {...form.register('isDefault')} />
            Đặt làm địa chỉ mặc định
          </label>
          <AppButton type="submit" className="mt-5" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu địa chỉ'}
          </AppButton>
        </form>
      )}

      {addressesQuery.isPending && <AppSkeleton />}
      {addressesQuery.isError && <ErrorState message={addressesQuery.error.message} />}
      {!addressesQuery.isPending && !addressesQuery.data?.length && <EmptyState message="Bạn chưa lưu địa chỉ nào." />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {addressesQuery.data?.map((address) => (
          <article
            key={address._id}
            className={`rounded-2xl border bg-white p-6 ${address.isDefault ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}
          >
            <div className="flex items-start gap-4">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                {address.isDefault ? <Home /> : <MapPin />}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">{address.label}</h2>
                  {address.isDefault && <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">Mặc định</span>}
                  {typeof address.latitude === 'number' && <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">Có tọa độ</span>}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {[address.addressLine, address.ward, address.district, address.city].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
            {!address.isDefault && (
              <AppButton
                variant="outline"
                className="mt-5 w-full"
                onClick={() => updateMutation.mutate({ id: address._id, payload: { isDefault: true } })}
                disabled={updateMutation.isPending}
              >
                Đặt làm mặc định
              </AppButton>
            )}
            <AppButton
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-red-600"
              onClick={async () => {
                const confirmed = await confirm({
                  title: 'Xóa địa chỉ này?',
                  description: `Địa chỉ “${address.label}” sẽ bị xóa khỏi danh sách đã lưu.`,
                  confirmLabel: 'Xóa địa chỉ',
                  variant: 'danger',
                })
                if (confirmed) deleteMutation.mutate(address._id)
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={16} />
              Xóa
            </AppButton>
          </article>
        ))}
      </div>
    </PageShell>
  )
}
