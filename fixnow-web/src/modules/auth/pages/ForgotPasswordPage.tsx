import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import forgotPasswordBackground from '../../../assets/background_authen/screen2.png'
import { AuthFooter } from '../components/AuthFooter'
import { MaterialIcon } from '../components/MaterialIcon'
import { useForgotPasswordMutation } from '../hooks/useAuth'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../validations/authSchemas'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const forgotPasswordMutation = useForgotPasswordMutation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email)
      navigate('/auth/verification', {
        state: { email: data.email, purpose: 'password-reset' },
      })
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Không thể gửi mã OTP',
      })
    }
  }

  return (
    <div className="auth-flow relative flex h-dvh w-full items-center justify-center overflow-hidden bg-background p-md text-on-background">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${forgotPasswordBackground}')` }} />
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]" />
      </div>

      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between px-lg py-md">
        <Link className="text-headline-md font-bold text-primary" to="/">FixNow</Link>
        <button className="flex items-center gap-xs text-on-surface-variant hover:opacity-80" type="button">
          <MaterialIcon>help</MaterialIcon><span className="text-label-md">Hỗ trợ</span>
        </button>
      </header>

      <main className="relative z-10 w-full max-w-[440px] px-sm">
        <div className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-xl md:p-xxl">
          <div className="mb-xl flex flex-col items-center gap-base">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg shadow-primary/20">
              <MaterialIcon className="scale-[1.5]" filled>lock_reset</MaterialIcon>
            </div>
            <h1 className="mt-base text-center text-headline-md font-semibold text-on-surface">Quên mật khẩu?</h1>
            <p className="max-w-[300px] text-center text-body-md text-on-surface-variant">Nhập email của bạn để nhận mã khôi phục tài khoản</p>
          </div>

          <form className="w-full space-y-lg" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-xs ml-xs block text-label-md text-on-surface" htmlFor="forgot-email">Địa chỉ Email</label>
              <div className="group relative">
                <MaterialIcon className="absolute top-1/2 left-md -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">mail</MaterialIcon>
                <input
                  className="w-full rounded-lg border-2 border-transparent bg-surface-container py-md pr-md pl-[48px] text-body-md text-on-surface transition-all placeholder:text-outline/50 focus:border-primary focus:ring-0"
                  id="forgot-email"
                  placeholder="example@gmail.com"
                  type="email"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-xs text-label-sm text-error">{errors.email.message}</p>}
            </div>
            {errors.root && <p className="text-center text-label-sm text-error">{errors.root.message}</p>}
            <button className="flex w-full items-center justify-center gap-base rounded-full bg-primary py-md text-title-lg font-semibold text-on-primary shadow-lg shadow-primary/30 transition-all hover:bg-surface-tint active:scale-[0.98] disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}<MaterialIcon>arrow_forward</MaterialIcon>
            </button>
          </form>

          <div className="mt-xl text-center">
            <Link className="group inline-flex items-center gap-xs text-label-md text-primary hover:text-surface-tint" to="/auth/login">
              <MaterialIcon className="text-sm transition-transform group-hover:-translate-x-1">arrow_back</MaterialIcon>
              <span>Quay lại Đăng nhập</span>
            </Link>
          </div>
        </div>

        <div className="mt-xl flex flex-col items-center justify-center gap-lg opacity-80 md:flex-row">
          <div className="flex items-center gap-xs"><MaterialIcon className="text-md text-outline">verified_user</MaterialIcon><span className="text-label-sm text-on-surface-variant">Bảo mật đa tầng</span></div>
          <div className="hidden h-1 w-1 rounded-full bg-outline-variant md:block" />
          <div className="flex items-center gap-xs"><MaterialIcon className="text-md text-outline">support_agent</MaterialIcon><span className="text-label-sm text-on-surface-variant">Hỗ trợ 24/7</span></div>
        </div>
      </main>
      <AuthFooter />
    </div>
  )
}
