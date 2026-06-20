import { zodResolver } from '@hookform/resolvers/zod'
import {
  BriefcaseBusiness,
  Camera,
  ChevronRight,
  CircleHelp,
  MapPin,
  Pencil,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useProfileQuery, useUpdateProfileMutation } from '../../auth/hooks/useAuth'
import { AppButton } from '../../../shared/components/AppButton'
import { AppInput } from '../../../shared/components/AppInput'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { PageShell } from '../../../shared/components/PageShell'
import { cn } from '../../../shared/utils/cn'
import {
  ProfileAddressPanel,
  ProfileSecurityPanel,
  ProfileSupportPanel,
  ProviderRegistrationPanel,
} from '../components/ProfilePanels'
import { useAddressesQuery } from '../hooks/useAddresses'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ tên'),
  phone: z.string().regex(/^(0|\+84)\d{9}$/, 'Số điện thoại không hợp lệ'),
})

type ProfileForm = z.infer<typeof profileSchema>
type ProfileTab = 'personal' | 'addresses' | 'wallet' | 'support' | 'provider'

const profileMenuItems: Array<{
  id: ProfileTab
  label: string
  icon: typeof UserRound
  disabled?: boolean
}> = [
  { id: 'personal', label: 'Thông tin cá nhân', icon: UserRound },
  { id: 'addresses', label: 'Quản lý địa chỉ', icon: MapPin },
  { id: 'wallet', label: 'Ví FixNow', icon: WalletCards, disabled: true },
  { id: 'support', label: 'Hỗ trợ & khiếu nại', icon: CircleHelp },
  { id: 'provider', label: 'Đăng ký thành nhà cung cấp', icon: BriefcaseBusiness },
]

export function ProfileCustomerPage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const profileQuery = useProfileQuery()
  const addressesQuery = useAddressesQuery()
  const updateProfileMutation = useUpdateProfileMutation()
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '' },
  })
  const hasProfileChanges = form.formState.isDirty

  useEffect(() => {
    if (!profileQuery.data) return
    form.reset({
      fullName: profileQuery.data.fullName,
      phone: profileQuery.data.phone ?? '',
    })
  }, [profileQuery.data, form])

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      setIsEditingProfile(false)
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ',
      })
    }
  }

  if (profileQuery.isPending) {
    return (
      <PageShell title="Hồ sơ cá nhân" description="Quản lý thông tin tài khoản.">
        <div className="grid gap-5"><AppSkeleton /><AppSkeleton /></div>
      </PageShell>
    )
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PageShell title="Hồ sơ cá nhân" description="Quản lý thông tin tài khoản.">
        <ErrorState message={profileQuery.error?.message} />
      </PageShell>
    )
  }

  const user = profileQuery.data
  const currentAddress = addressesQuery.data?.find((address) => address.isDefault) ?? addressesQuery.data?.[0]
  const currentAddressText = currentAddress
    ? [currentAddress.addressLine, currentAddress.ward, currentAddress.district, currentAddress.city]
        .filter(Boolean)
        .join(', ')
    : addressesQuery.isPending
      ? 'Đang tải...'
      : 'Chưa cập nhật'

  return (
    <PageShell title="Hồ sơ cá nhân" description="Quản lý thông tin tài khoản FixNow.">
      <div className="grid items-start gap-7 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <div className="relative mx-auto w-fit">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-100" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-100">
                  <UserRound size={48} />
                </div>
              )}
              <button type="button" className="absolute right-0 bottom-0 rounded-full border-2 border-white bg-blue-600 p-2 text-white" aria-label="Cập nhật ảnh đại diện">
                <Camera size={17} />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-bold">{user.fullName}</h2>
            <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
          </section>

          <nav className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2" aria-label="Menu hồ sơ">
            {profileMenuItems.map(({ id, label, icon: Icon, disabled }) => (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => setActiveTab(id)}
                title={disabled ? 'Tính năng đang được phát triển' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700',
                  activeTab === id && 'bg-blue-50 text-blue-700',
                  disabled && 'cursor-not-allowed text-slate-400 hover:bg-transparent hover:text-slate-400',
                )}
              >
                <span className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600',
                  activeTab === id && 'bg-blue-100 text-blue-700',
                )}>
                  <Icon size={20} />
                </span>
                <span className="flex-1 text-left text-sm font-semibold">{label}</span>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          {activeTab === 'personal' && (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <UserRound className="text-blue-600" />
                    Thông tin chi tiết
                  </h2>
                  {!isEditingProfile && (
                    <AppButton type="button" variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                      <Pencil size={16} />
                      Chỉnh sửa thông tin
                    </AppButton>
                  )}
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <AppInput label="Họ và tên" readOnly={!isEditingProfile} className={!isEditingProfile ? 'bg-slate-50' : undefined} error={form.formState.errors.fullName?.message} {...form.register('fullName')} />
                  <AppInput label="Số điện thoại" readOnly={!isEditingProfile} className={!isEditingProfile ? 'bg-slate-50' : undefined} error={form.formState.errors.phone?.message} {...form.register('phone')} />
                  <AppInput label="Email" type="email" value={user.email} readOnly />
                  <AppInput label="Địa chỉ hiện tại" value={currentAddressText} readOnly />
                </div>
                {form.formState.errors.root && <p className="mt-4 text-sm text-red-600">{form.formState.errors.root.message}</p>}
              </section>

              <ProfileSecurityPanel />

              {isEditingProfile && (hasProfileChanges || updateProfileMutation.isSuccess) && (
                <div className="flex items-center gap-4">
                  {hasProfileChanges && (
                    <AppButton type="submit" size="lg" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </AppButton>
                  )}
                  {!hasProfileChanges && updateProfileMutation.isSuccess && (
                    <span className="text-sm font-semibold text-green-600">Đã lưu thông tin</span>
                  )}
                </div>
              )}
            </form>
          )}
          {activeTab === 'addresses' && <ProfileAddressPanel />}
          {activeTab === 'support' && <ProfileSupportPanel />}
          {activeTab === 'provider' && <ProviderRegistrationPanel />}
        </main>
      </div>
    </PageShell>
  )
}
