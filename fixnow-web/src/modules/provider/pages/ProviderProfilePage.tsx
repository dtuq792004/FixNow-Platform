import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  Banknote,
  Camera,
  Clock3,
  MapPin,
  Pencil,
  Save,
  ShieldCheck,
  Star,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { authService } from '../../auth/services/authService'
import { useAuthStore } from '../../auth/store/authStore'
import { ProviderCard, ProviderPageHeader } from '../components/ProviderPageHeader'
import { providerKeys, useProviderProfile } from '../hooks/useProvider'
import { providerService } from '../services/providerService'

const schedulePeriodSchema = z.object({
  enabled: z.boolean(),
  start: z.string(),
  end: z.string(),
})

const schema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên'),
  phone: z.string().trim().regex(/^[0-9+\s]{9,15}$/, 'Số điện thoại không hợp lệ'),
  description: z.string().trim().min(20, 'Giới thiệu cần ít nhất 20 ký tự'),
  experienceYears: z.number().min(0).max(80),
  workingAreas: z.string().trim().min(2, 'Vui lòng nhập ít nhất một khu vực'),
  operatingRadiusKm: z.number().min(1).max(50),
  workingSchedule: z.object({
    weekdays: schedulePeriodSchema,
    saturday: schedulePeriodSchema,
    sunday: schedulePeriodSchema,
  }),
})

type FormData = z.infer<typeof schema>

const defaultSchedule = {
  weekdays: { enabled: true, start: '08:00', end: '18:00' },
  saturday: { enabled: true, start: '09:00', end: '16:00' },
  sunday: { enabled: false, start: '09:00', end: '16:00' },
}

export function ProviderProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const profileQuery = useProviderProfile()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      description: '',
      experienceYears: 0,
      workingAreas: '',
      operatingRadiusKm: 15,
      workingSchedule: defaultSchedule,
    },
  })
  const operatingRadiusKm = useWatch({
    control: form.control,
    name: 'operatingRadiusKm',
  })

  useEffect(() => {
    const profile = profileQuery.data
    if (!profile) return
    form.reset({
      fullName: profile.user.fullName,
      phone: profile.user.phone ?? '',
      description: profile.description,
      experienceYears: profile.experienceYears,
      workingAreas: profile.workingAreas.join(', '),
      operatingRadiusKm: profile.operatingRadiusKm ?? 15,
      workingSchedule: profile.workingSchedule ?? defaultSchedule,
    })
  }, [form, profileQuery.data])

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await Promise.all([
        authService.updateProfile({ fullName: data.fullName, phone: data.phone }),
        providerService.updateProviderProfile({
          description: data.description,
          experienceYears: data.experienceYears,
          workingAreas: data.workingAreas.split(',').map((item) => item.trim()).filter(Boolean),
          operatingRadiusKm: data.operatingRadiusKm,
          workingSchedule: data.workingSchedule,
        }),
      ])
    },
    onSuccess: () => {
      setIsEditingPersonal(false)
      queryClient.invalidateQueries({ queryKey: providerKeys.profile })
    },
  })

  const avatarMutation = useMutation({
    mutationFn: authService.uploadAvatar,
    onSuccess: ({ data }) => {
      setUser(data)
      queryClient.invalidateQueries({ queryKey: providerKeys.profile })
    },
  })

  const statusMutation = useMutation({
    mutationFn: () =>
      providerService.updateStatus(
        profileQuery.data?.activeStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE',
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.profile }),
  })

  if (profileQuery.isLoading) {
    return <div className="mx-auto max-w-6xl p-6"><AppSkeleton /></div>
  }
  if (profileQuery.isError || !profileQuery.data) {
    return <div className="mx-auto max-w-6xl p-6"><ErrorState /></div>
  }

  const profile = profileQuery.data
  const categories = profile.serviceCategories.filter(
    (item): item is { _id: string; name?: string; type?: string } => typeof item !== 'string',
  )
  const accountNumber = profile.bankAccount?.accountNumber ?? ''

  return (
    <form
      onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))}
      className="mx-auto max-w-6xl space-y-7 px-4 py-6 sm:px-6"
    >
      <ProviderPageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin hiển thị, khu vực phục vụ và lịch làm việc của bạn."
      />

      <ProviderCard className="relative overflow-hidden p-5 sm:p-8">
        <div className="absolute inset-y-0 right-0 w-2/5 rounded-l-full bg-gradient-to-br from-blue-600/5 to-cyan-400/10" />
        <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:items-start">
          <div className="relative shrink-0">
            {profile.user.avatar ? (
              <img src={profile.user.avatar} alt={profile.user.fullName} className="h-32 w-32 rounded-3xl border-4 border-white object-cover shadow-lg sm:h-40 sm:w-40" />
            ) : (
              <span className="flex h-32 w-32 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 shadow-lg sm:h-40 sm:w-40">
                <UserRound size={64} />
              </span>
            )}
            <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarMutation.isPending} className="absolute -right-2 -bottom-2 flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
              <Camera size={18} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) avatarMutation.mutate(file)
              event.target.value = ''
            }} />
          </div>

          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">{profile.user.fullName}</h2>
              {profile.verified && <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"><BadgeCheck size={15} /> Đã xác minh</span>}
            </div>
            <p className="mt-2 text-slate-500">{categories.map((item) => item.name).filter(Boolean).join(' · ') || 'Provider FixNow'}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:max-w-xl sm:gap-4">
              <Stat value={`${profile.experienceYears}+`} label="Năm kinh nghiệm" />
              <Stat value={profile.stats.completedJobs.toLocaleString('vi-VN')} label="Đơn hoàn thành" />
              <Stat value={profile.stats.averageRating ? profile.stats.averageRating.toFixed(1) : '—'} label={`${profile.stats.totalReviews} đánh giá`} star />
            </div>
          </div>

        </div>
      </ProviderCard>

      <div className="grid gap-7 lg:grid-cols-12">
        <div className="space-y-7 lg:col-span-7">
          <ProviderCard className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle icon={<UserRound />} title="Cài đặt cá nhân" />
              {isEditingPersonal ? (
                <div className="flex items-center gap-2">
                  <AppButton
                    type="button"
                    variant="outline"
                    disabled={saveMutation.isPending}
                    onClick={() => {
                      form.reset({
                        fullName: profile.user.fullName,
                        phone: profile.user.phone ?? '',
                        description: profile.description,
                        experienceYears: profile.experienceYears,
                        workingAreas: profile.workingAreas.join(', '),
                        operatingRadiusKm: profile.operatingRadiusKm ?? 15,
                        workingSchedule: profile.workingSchedule ?? defaultSchedule,
                      })
                      setIsEditingPersonal(false)
                    }}
                  >
                    Hủy
                  </AppButton>
                  <AppButton type="submit" disabled={saveMutation.isPending}>
                    <Save size={17} />
                    {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                  </AppButton>
                </div>
              ) : (
                <AppButton type="button" variant="outline" onClick={() => setIsEditingPersonal(true)}>
                  <Pencil size={16} />
                  Chỉnh sửa thông tin
                </AppButton>
              )}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Họ và tên" error={form.formState.errors.fullName?.message}><input {...form.register('fullName')} disabled={!isEditingPersonal} className="profile-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" /></Field>
              <Field label="Số điện thoại" error={form.formState.errors.phone?.message}><input {...form.register('phone')} disabled={!isEditingPersonal} className="profile-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" /></Field>
              <Field label="Email"><input value={profile.user.email} readOnly className="profile-input bg-slate-50 text-slate-500" /></Field>
              <Field label="Số năm kinh nghiệm" error={form.formState.errors.experienceYears?.message}><input type="number" {...form.register('experienceYears', { valueAsNumber: true })} disabled={!isEditingPersonal} className="profile-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" /></Field>
              <Field className="sm:col-span-2" label="Khu vực làm việc" error={form.formState.errors.workingAreas?.message}><input {...form.register('workingAreas')} disabled={!isEditingPersonal} className="profile-input disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" placeholder="Hải Châu, Thanh Khê, Đà Nẵng" /></Field>
              <Field className="sm:col-span-2" label="Giới thiệu bản thân" error={form.formState.errors.description?.message}><textarea rows={5} {...form.register('description')} disabled={!isEditingPersonal} className="profile-input h-auto resize-none py-3 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" /></Field>
            </div>
          </ProviderCard>

          <ProviderCard className="p-5 sm:p-6">
            <SectionTitle icon={<Wrench />} title="Chuyên môn & xác minh" />
            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
              <p className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} /> Hồ sơ chuyên môn {profile.verified ? 'đã được FixNow xác minh' : 'đang chờ xác minh'}</p>
              <p className="mt-1 text-blue-700">Chứng chỉ được quản lý trong quy trình xác minh provider để đảm bảo tính chính xác.</p>
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-600">Danh mục kỹ năng</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.length ? categories.map((category) => (
                <span key={category._id} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{category.name}</span>
              )) : <p className="text-sm text-slate-500">Chưa có danh mục chuyên môn.</p>}
            </div>
          </ProviderCard>
        </div>

        <div className="space-y-7 lg:col-span-5">
          <ProviderCard className="p-5 sm:p-6">
            <SectionTitle icon={<MapPin />} title="Khu vực & thời gian" />
            <div className="mt-6">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold">Bán kính hoạt động</span><b className="text-xl text-blue-700">{operatingRadiusKm} km</b></div>
              <input type="range" min={1} max={50} {...form.register('operatingRadiusKm', { valueAsNumber: true })} className="mt-4 w-full accent-blue-600" />
              <div className="mt-1 flex justify-between text-xs text-slate-400"><span>1 km</span><span>50 km</span></div>
            </div>
            <div className="mt-7 space-y-3">
              <p className="text-sm font-semibold">Lịch làm việc trong tuần</p>
              <ScheduleRow label="Thứ 2 - Thứ 6" name="weekdays" form={form} />
              <ScheduleRow label="Thứ 7" name="saturday" form={form} />
              <ScheduleRow label="Chủ nhật" name="sunday" form={form} />
            </div>
          </ProviderCard>

          <ProviderCard className="p-5 sm:p-6">
            <SectionTitle icon={<Banknote />} title="Tài khoản ngân hàng" />
            {profile.bankAccount ? (
              <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-6 text-white shadow-lg">
                <p className="text-xs text-blue-100">Ngân hàng liên kết gần nhất</p>
                <p className="mt-1 font-bold">{profile.bankAccount.bankName}</p>
                <p className="mt-8 font-mono text-xl tracking-widest">**** **** {accountNumber.slice(-4)}</p>
                <p className="mt-4 text-xs text-blue-100">CHỦ TÀI KHOẢN</p>
                <p className="font-semibold uppercase">{profile.bankAccount.accountHolder}</p>
              </div>
            ) : <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Chưa có tài khoản ngân hàng từ giao dịch rút tiền.</div>}
            <AppButton type="button" variant="outline" className="mt-4 w-full" onClick={() => navigate('/provider/wallet')}>Quản lý tại Ví</AppButton>
          </ProviderCard>
        </div>
      </div>

      <ProviderCard className="flex flex-col gap-4 border-red-100 bg-red-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="font-bold text-red-700">Trạng thái hoạt động</h3><p className="mt-1 text-sm text-slate-500">Tạm dừng nhận đơn mới mà không ảnh hưởng dữ liệu tài khoản.</p></div>
        <AppButton type="button" variant={profile.activeStatus === 'ONLINE' ? 'danger' : 'primary'} disabled={statusMutation.isPending} onClick={() => statusMutation.mutate()}>
          {profile.activeStatus === 'ONLINE' ? 'Tạm dừng hoạt động' : 'Bật nhận đơn'}
        </AppButton>
      </ProviderCard>

      {saveMutation.isSuccess && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">Đã cập nhật hồ sơ thành công.</p>}
      {(saveMutation.isError || avatarMutation.isError || statusMutation.isError) && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Không thể cập nhật hồ sơ. Vui lòng thử lại.</p>}
    </form>
  )
}

function Stat({ value, label, star }: { value: string; label: string; star?: boolean }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-center transition-all hover:bg-blue-100/50 sm:p-4">
      <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-700">
        <span>{value}</span>
        {star && <Star size={16} className="shrink-0 fill-amber-400 text-amber-400" />}
      </div>
      <p className="mt-1 text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">
        {label}
      </p>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900"><span className="text-blue-600">{icon}</span>{title}</h2>
}

function Field({ label, error, className = '', children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={`block text-sm font-semibold text-slate-700 ${className}`}>{label}<span className="mt-2 block">{children}</span>{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>
}

function ScheduleRow({ label, name, form }: { label: string; name: 'weekdays' | 'saturday' | 'sunday'; form: UseFormReturn<FormData> }) {
  const enabled = useWatch({
    control: form.control,
    name: `workingSchedule.${name}.enabled`,
  })
  return <div className={`rounded-xl bg-slate-50 p-3 ${enabled ? '' : 'opacity-60'}`}><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{label}</span><label className="relative inline-flex cursor-pointer items-center"><input type="checkbox" {...form.register(`workingSchedule.${name}.enabled`)} className="peer sr-only" /><span className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:top-1 after:left-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-5" /></label></div>{enabled && <div className="mt-3 flex items-center gap-2"><Clock3 size={15} className="text-slate-400" /><input type="time" {...form.register(`workingSchedule.${name}.start`)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-2 text-sm" /><span className="text-slate-400">-</span><input type="time" {...form.register(`workingSchedule.${name}.end`)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-2 text-sm" /></div>}</div>
}
