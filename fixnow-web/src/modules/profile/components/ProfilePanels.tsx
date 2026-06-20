import { zodResolver } from '@hookform/resolvers/zod'
import {
  BellRing,
  BriefcaseBusiness,
  ChevronRight,
  CircleCheck,
  Home,
  LocateFixed,
  LockKeyhole,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authenticatedRequest } from '../../auth/services/authService'
import { AppButton } from '../../../shared/components/AppButton'
import { AppInput } from '../../../shared/components/AppInput'
import { AppSkeleton, EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { useConfirm } from '../../../shared/store/confirmStore'
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from '../hooks/useAddresses'

const addressSchema = z.object({
  label: z.string().min(1, 'Vui lòng nhập tên địa chỉ'),
  addressLine: z.string().min(3, 'Vui lòng nhập số nhà, tên đường'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  city: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  isDefault: z.boolean(),
})

type AddressForm = z.infer<typeof addressSchema>

export function ProfileAddressPanel() {
  const confirm = useConfirm()
  const [showForm, setShowForm] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const addressesQuery = useAddressesQuery()
  const createMutation = useCreateAddressMutation()
  const updateMutation = useUpdateAddressMutation()
  const deleteMutation = useDeleteAddressMutation()
  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', addressLine: '', ward: '', district: '', city: '', isDefault: false },
  })

  const submit = async (data: AddressForm) => {
    await createMutation.mutateAsync({ ...data, ...coordinates })
    form.reset()
    setCoordinates(null)
    setLocationMessage(null)
    setShowForm(false)
  }

  const locateAddress = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Trình duyệt không hỗ trợ định vị GPS.')
      return
    }

    setIsLocating(true)
    setLocationMessage(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
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

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Quản lý địa chỉ"
        description="Lưu và quản lý các địa chỉ thường dùng khi đặt dịch vụ."
        action={
          <AppButton type="button" onClick={() => setShowForm((value) => !value)}>
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Đóng' : 'Thêm địa chỉ'}
          </AppButton>
        }
      />

      {showForm && (
        <form onSubmit={form.handleSubmit(submit)} className="rounded-2xl border border-slate-200 bg-white p-6">
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
          <label className="mt-4 flex items-center gap-2 text-sm">
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

      <div className="grid gap-4 xl:grid-cols-2">
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
                  <h3 className="font-bold">{address.label}</h3>
                  {address.isDefault && <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">Mặc định</span>}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {[address.addressLine, address.ward, address.district, address.city].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
            {!address.isDefault && (
              <AppButton
                type="button"
                variant="outline"
                className="mt-5 w-full"
                onClick={() => updateMutation.mutate({ id: address._id, payload: { isDefault: true } })}
                disabled={updateMutation.isPending}
              >
                Đặt làm mặc định
              </AppButton>
            )}
            <AppButton
              type="button"
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
              <Trash2 size={16} /> Xóa
            </AppButton>
          </article>
        ))}
      </div>
    </div>
  )
}

const supportSchema = z.object({
  issue: z.string().min(1, 'Vui lòng chọn loại vấn đề'),
  requestCode: z.string(),
  message: z.string().min(10, 'Nội dung cần ít nhất 10 ký tự'),
})

type SupportForm = z.infer<typeof supportSchema>

export function ProfileSupportPanel() {
  const [sent, setSent] = useState(false)
  const form = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
    defaultValues: { issue: 'Vấn đề về đơn hàng', requestCode: '', message: '' },
  })

  const submit = async () => {
    setSent(true)
    form.reset()
  }

  return (
    <div className="space-y-6">
      <PanelHeader title="Hỗ trợ & khiếu nại" description="Gửi yêu cầu để đội ngũ FixNow kiểm tra và phản hồi." />
      <form onSubmit={form.handleSubmit(submit)} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Loại vấn đề</span>
            <select className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-blue-500" {...form.register('issue')}>
              <option>Vấn đề về đơn hàng</option>
              <option>Khiếu nại kỹ thuật viên</option>
              <option>Thanh toán và hoàn tiền</option>
              <option>Lỗi ứng dụng/Website</option>
              <option>Vấn đề khác</option>
            </select>
          </label>
          <AppInput label="Mã yêu cầu (nếu có)" placeholder="Ví dụ: FN123456" {...form.register('requestCode')} />
        </div>
        <label className="mt-5 block space-y-2 text-sm font-medium text-slate-700">
          <span>Nội dung chi tiết</span>
          <textarea
            className="min-h-36 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            placeholder="Mô tả vấn đề bạn đang gặp phải..."
            {...form.register('message')}
          />
          {form.formState.errors.message && <span className="block text-sm text-red-600">{form.formState.errors.message.message}</span>}
        </label>
        <div className="mt-5 flex items-center gap-4">
          <AppButton type="submit" disabled={form.formState.isSubmitting}><Send size={17} /> Gửi yêu cầu</AppButton>
          {sent && <span className="flex items-center gap-2 text-sm font-semibold text-green-600"><CircleCheck size={18} /> Đã ghi nhận yêu cầu</span>}
        </div>
      </form>
    </div>
  )
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(8, 'Mật khẩu mới cần ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

export function ProfileSecurityPanel() {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [appNotifications, setAppNotifications] = useState(true)
  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const closePasswordModal = useCallback(() => {
    if (form.formState.isSubmitting) return
    form.reset()
    setShowPasswordForm(false)
  }, [form])

  useEffect(() => {
    if (!showPasswordForm) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePasswordModal()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showPasswordForm, closePasswordModal])

  const submit = async (data: PasswordForm) => {
    try {
      await authenticatedRequest('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      form.reset()
      setPasswordChanged(true)
      setShowPasswordForm(false)
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Không thể đổi mật khẩu',
      })
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="text-blue-600" />
            Bảo mật
          </h2>
          <button
            type="button"
            onClick={() => {
              setPasswordChanged(false)
              setShowPasswordForm(true)
            }}
            className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50"
          >
            <span className="flex items-center gap-3">
              <span className="rounded-xl bg-blue-50 p-2 text-blue-600"><LockKeyhole size={20} /></span>
              <span>
                <strong className="block text-sm">Đổi mật khẩu</strong>
                <span className="text-xs text-slate-500">Cập nhật mật khẩu đăng nhập</span>
              </span>
            </span>
            <ChevronRight size={19} className="text-slate-400" />
          </button>
          {passwordChanged && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600"><CircleCheck size={17} /> Đổi mật khẩu thành công</p>}
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <BellRing className="text-blue-600" />
            Thông báo
          </h2>
          <div className="mt-5 space-y-5">
            <NotificationToggle label="Thông báo qua Email" checked={emailNotifications} onChange={setEmailNotifications} />
            <NotificationToggle label="Thông báo trên ứng dụng" checked={appNotifications} onChange={setAppNotifications} />
          </div>
        </div>
      </div>

      {showPasswordForm && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-[2px] sm:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          aria-describedby="change-password-description"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePasswordModal()
          }}
        >
          <form
            onSubmit={form.handleSubmit(submit)}
            className="my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <LockKeyhole size={22} />
                </span>
                <div>
                  <h2 id="change-password-title" className="text-xl font-bold text-slate-900">
                    Đổi mật khẩu
                  </h2>
                  <p id="change-password-description" className="mt-1 text-sm leading-5 text-slate-500">
                    Sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Đóng"
                onClick={closePasswordModal}
                disabled={form.formState.isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-7">
              <div className="grid gap-5">
              <AppInput label="Mật khẩu hiện tại" type="password" autoComplete="current-password" error={form.formState.errors.currentPassword?.message} {...form.register('currentPassword')} />
              <AppInput label="Mật khẩu mới" type="password" autoComplete="new-password" error={form.formState.errors.newPassword?.message} {...form.register('newPassword')} />
              <AppInput label="Xác nhận mật khẩu mới" type="password" autoComplete="new-password" error={form.formState.errors.confirmPassword?.message} {...form.register('confirmPassword')} />
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                Mật khẩu mới phải có ít nhất 8 ký tự và nên kết hợp chữ hoa, chữ thường, số.
              </div>

              {form.formState.errors.root && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {form.formState.errors.root.message}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <AppButton type="button" variant="outline" onClick={closePasswordModal} disabled={form.formState.isSubmitting}>
                Hủy
              </AppButton>
              <AppButton type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </AppButton>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </section>
  )
}

function NotificationToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-sm text-slate-700">
      <span>{label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
      </span>
    </label>
  )
}

const providerSchema = z.object({
  description: z.string().min(10, 'Giới thiệu cần ít nhất 10 ký tự').max(1000),
  experienceYears: z.number().int().min(0, 'Số năm kinh nghiệm không hợp lệ').max(60),
  serviceCategories: z.string().min(1, 'Vui lòng nhập ít nhất một chuyên môn'),
  workingAreas: z.string().min(1, 'Vui lòng nhập ít nhất một khu vực'),
})

type ProviderForm = z.infer<typeof providerSchema>

export function ProviderRegistrationPanel() {
  const [success, setSuccess] = useState(false)
  const form = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: { description: '', experienceYears: 0, serviceCategories: '', workingAreas: '' },
  })

  const submit = async (data: ProviderForm) => {
    try {
      await authenticatedRequest('/provider-requests', {
        method: 'POST',
        body: JSON.stringify({
          description: data.description,
          experienceYears: data.experienceYears,
          serviceCategories: data.serviceCategories.split(',').map((item) => item.trim()).filter(Boolean),
          workingAreas: data.workingAreas.split(',').map((item) => item.trim()).filter(Boolean),
        }),
      })
      setSuccess(true)
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Không thể gửi hồ sơ đăng ký',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PanelHeader title="Đăng ký thành nhà cung cấp" description="Gửi hồ sơ để trở thành đối tác cung cấp dịch vụ trên FixNow." />
      <form onSubmit={form.handleSubmit(submit)} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
        <div className="mb-6 flex items-start gap-4 rounded-2xl bg-blue-50 p-5 text-blue-800">
          <BriefcaseBusiness className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">Hồ sơ sẽ được quản trị viên xét duyệt trước khi tài khoản có thể nhận công việc.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <AppInput label="Số năm kinh nghiệm" type="number" min="0" max="60" error={form.formState.errors.experienceYears?.message} {...form.register('experienceYears', { valueAsNumber: true })} />
          <AppInput label="Chuyên môn" placeholder="Điện lạnh, điện nước..." error={form.formState.errors.serviceCategories?.message} {...form.register('serviceCategories')} />
          <AppInput label="Khu vực làm việc" placeholder="Quận 1, Quận 3..." error={form.formState.errors.workingAreas?.message} {...form.register('workingAreas')} />
        </div>
        <label className="mt-5 block space-y-2 text-sm font-medium text-slate-700">
          <span>Giới thiệu kinh nghiệm</span>
          <textarea className="min-h-36 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500" {...form.register('description')} />
          {form.formState.errors.description && <span className="block text-sm text-red-600">{form.formState.errors.description.message}</span>}
        </label>
        {form.formState.errors.root && <p className="mt-4 text-sm text-red-600">{form.formState.errors.root.message}</p>}
        <div className="mt-5 flex items-center gap-4">
          <AppButton type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Đang gửi...' : 'Gửi hồ sơ đăng ký'}
          </AppButton>
          {success && <span className="flex items-center gap-2 text-sm font-semibold text-green-600"><CircleCheck size={18} /> Đã gửi hồ sơ</span>}
        </div>
      </form>
    </div>
  )
}

function PanelHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}
