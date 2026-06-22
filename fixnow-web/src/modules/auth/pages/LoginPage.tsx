import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import loginBackground from '../../../assets/background_authen/screen.png'
import { ApiError } from '../../../shared/services/apiClient'
import { MaterialIcon } from '../components/MaterialIcon'
import { SocialAuthButtons } from '../components/SocialAuthButtons'
import { useLoginMutation } from '../hooks/useAuth'
import { getPostLoginPath } from '../utils/getPostLoginPath'
import {
  loginSchema,
  type LoginFormData,
} from '../validations/authSchemas'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLoginMutation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identity: '', password: '', remember: false },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: data.identity,
        password: data.password,
        remember: data.remember,
      })
      const requestedPath =
        typeof location.state === 'object' &&
          location.state !== null &&
          'redirectTo' in location.state &&
          typeof location.state.redirectTo === 'string'
          ? location.state.redirectTo
          : undefined

      navigate(getPostLoginPath(response.user.role, requestedPath), { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/auth/verification', {
          state: { email: data.identity, purpose: 'email-verification' },
        })
        return
      }

      setError('root', {
        message: error instanceof Error ? error.message : 'Đăng nhập thất bại',
      })
    }
  }

  return (
    <div className="auth-flow relative flex h-dvh w-full flex-col overflow-hidden bg-surface-bright">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${loginBackground}')` }}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        </div>
      </div>

      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-transparent px-lg py-md">
        <Link className="text-headline-md font-extrabold tracking-tight text-white drop-shadow-md" to="/">
          FIXNOW
        </Link>
        <button
          className="flex items-center justify-center p-base text-white transition hover:opacity-80 active:scale-95"
          title="Trợ giúp"
          type="button"
        >
          <MaterialIcon>help</MaterialIcon>
        </button>
      </header>

      <main className="relative z-10 flex min-h-0 flex-grow items-center justify-center px-4 py-16 sm:px-md">
        <div className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-xl sm:py-6">
            <div className="space-y-base text-center">
              <div className="inline-block text-headline-md font-extrabold tracking-tight text-transparent bg-clip-text bg-header-gradient">FIXNOW</div>
              <h1 className="text-headline-md font-semibold text-on-surface">Chào mừng trở lại</h1>
              <p className="text-body-md text-on-surface-variant">Vui lòng nhập thông tin để tiếp tục</p>
              {typeof location.state === 'object' &&
                location.state !== null &&
                'message' in location.state &&
                typeof location.state.message === 'string' && (
                  <p className="rounded-lg bg-green-50 p-3 text-label-sm text-green-700">
                    {location.state.message}
                  </p>
                )}
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-xs">
                <label className="block text-label-md font-medium text-on-surface-variant" htmlFor="identity">
                  Email
                </label>
                <input
                  className="h-[48px] w-full rounded-lg border border-outline-variant px-md py-base text-body-md transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  id="identity"
                  placeholder="name@example.com"
                  {...register('identity')}
                />
                {errors.identity && <p className="text-label-sm text-error">{errors.identity.message}</p>}
              </div>

              <div className="space-y-xs">
                <label className="block text-label-md font-medium text-on-surface-variant" htmlFor="login-password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    className="h-[48px] w-full rounded-lg border border-outline-variant px-md py-base pr-12 text-body-md transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    id="login-password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button
                    className="absolute top-1/2 right-md -translate-y-1/2 text-on-surface-variant hover:text-primary"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    <MaterialIcon className="text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </MaterialIcon>
                  </button>
                </div>
                {errors.password && <p className="text-label-sm text-error">{errors.password.message}</p>}
              </div>

              <div className="flex flex-col gap-3 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
                <label className="flex cursor-pointer items-center gap-base">
                  <input
                    className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                    type="checkbox"
                    {...register('remember')}
                  />
                  <span className="text-label-md text-on-surface-variant">Ghi nhớ đăng nhập</span>
                </label>
                <Link className="text-label-md text-primary hover:underline" to="/auth/forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>

              {errors.root && <p className="text-center text-label-sm text-error">{errors.root.message}</p>}

              <button
                className="h-[48px] w-full rounded-lg bg-header-gradient text-title-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-outline-variant" />
              <span className="mx-md flex-shrink text-label-sm text-on-surface-variant">Hoặc đăng nhập với</span>
              <div className="flex-grow border-t border-outline-variant" />
            </div>

            <SocialAuthButtons />

            <p className="text-center text-body-md text-on-surface-variant">
              Chưa có tài khoản?{' '}
              <Link className="font-bold text-primary hover:underline" to="/auth/signup">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
