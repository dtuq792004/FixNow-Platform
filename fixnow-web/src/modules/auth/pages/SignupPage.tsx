import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import signupBackground from '../../../assets/background_authen/screen1.png'
import { AuthFooter } from '../components/AuthFooter'
import { MaterialIcon } from '../components/MaterialIcon'
import { SocialAuthButtons } from '../components/SocialAuthButtons'
import { useRegisterMutation } from '../hooks/useAuth'
import {
  signupSchema,
  type SignupFormData,
} from '../validations/authSchemas'

const fields = [
  { name: 'fullName', label: 'Họ và tên', icon: 'person', placeholder: 'Nguyễn Văn A', type: 'text' },
  { name: 'phone', label: 'Số điện thoại', icon: 'call', placeholder: '09xx xxx xxx', type: 'tel' },
  { name: 'email', label: 'Email', icon: 'mail', placeholder: 'email@vi-du.com', type: 'email' },
] as const

export function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const registerMutation = useRegisterMutation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', phone: '', email: '', password: '', terms: false },
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      await registerMutation.mutateAsync({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
      })
      navigate('/auth/verification', {
        state: { email: data.email, purpose: 'email-verification' },
      })
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Đăng ký thất bại',
      })
    }
  }

  return (
    <div className="auth-flow relative flex min-h-dvh w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-surface px-4 pb-8 pt-20 sm:px-md sm:py-md">
      <div
        className="absolute inset-0 z-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: `url('${signupBackground}')` }}
      />
      <div className="absolute inset-0 z-10 bg-black/30" />

      <main className="relative z-20 w-full max-w-[440px]">
        <div className="auth-card flex flex-col gap-md rounded-2xl border border-slate-200 bg-white p-lg shadow-2xl">
          <div className="flex flex-col items-center gap-xs text-center">
            <div className="flex items-center gap-xs">
              <MaterialIcon className="text-headline-lg text-transparent bg-clip-text bg-header-gradient" filled>tools_power_drill</MaterialIcon>
              <span className="text-headline-md font-extrabold tracking-tight text-transparent bg-clip-text bg-header-gradient">FixNow</span>
            </div>
            <h1 className="text-headline-md font-semibold text-on-surface">Tạo tài khoản mới</h1>
            <p className="text-body-md text-on-surface-variant">
              Tham gia cùng hàng nghìn khách hàng tin dùng FixNow cho mọi dịch vụ sửa chữa.
            </p>
          </div>

          <form className="flex flex-col gap-sm" onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field) => (
              <div className="flex flex-col gap-xs" key={field.name}>
                <label className="text-label-md text-on-surface-variant" htmlFor={field.name}>{field.label}</label>
                <div className="group relative">
                  <MaterialIcon className="absolute top-1/2 left-md -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">
                    {field.icon}
                  </MaterialIcon>
                  <input
                    className="glass-input h-11 w-full rounded-lg border border-outline-variant pr-md pl-11 text-body-md outline-none"
                    id={field.name}
                    placeholder={field.placeholder}
                    type={field.type}
                    {...register(field.name)}
                  />
                </div>
                {errors[field.name] && <p className="text-label-sm text-error">{errors[field.name]?.message}</p>}
              </div>
            ))}

            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="signup-password">Mật khẩu</label>
              <div className="group relative">
                <MaterialIcon className="absolute top-1/2 left-md -translate-y-1/2 text-outline group-focus-within:text-primary">lock</MaterialIcon>
                <input
                  className="glass-input h-11 w-full rounded-lg border border-outline-variant pr-[48px] pl-11 text-body-md outline-none"
                  id="signup-password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                />
                <button className="absolute top-1/2 right-md -translate-y-1/2 text-outline hover:text-on-surface" onClick={() => setShowPassword((value) => !value)} type="button">
                  <MaterialIcon>{showPassword ? 'visibility_off' : 'visibility'}</MaterialIcon>
                </button>
              </div>
              {errors.password && <p className="text-label-sm text-error">{errors.password.message}</p>}
            </div>

            <div className="flex items-start gap-sm">
              <input className="mt-1 h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary" id="terms" type="checkbox" {...register('terms')} />
              <label className="text-label-md leading-tight text-on-surface-variant" htmlFor="terms">
                Tôi đồng ý với <Link className="text-primary hover:underline" to="/terms">Điều khoản &amp; Chính sách</Link> của FixNow.
              </label>
            </div>
            {errors.terms && <p className="text-label-sm text-error">{errors.terms.message}</p>}
            {errors.root && <p className="text-center text-label-sm text-error">{errors.root.message}</p>}

            <button className="flex h-12 items-center justify-center gap-xs rounded-lg bg-header-gradient text-title-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="flex items-center gap-md">
            <div className="h-px flex-1 bg-outline-variant" />
            <span className="text-label-sm text-outline">Hoặc</span>
            <div className="h-px flex-1 bg-outline-variant" />
          </div>

          <SocialAuthButtons />

          <p className="text-center text-body-md text-on-surface-variant">
            Đã có tài khoản? <Link className="font-bold text-primary hover:underline" to="/auth/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </main>
      <AuthFooter />
    </div>
  )
}
