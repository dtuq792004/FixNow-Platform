import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { AppInput } from '../../../shared/components/AppInput'
import { useResetPasswordMutation } from '../hooks/useAuth'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../validations/authSchemas'

export function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const resetPasswordMutation = useResetPasswordMutation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const resetToken =
    typeof location.state === 'object' &&
    location.state !== null &&
    'resetToken' in location.state &&
    typeof location.state.resetToken === 'string'
      ? location.state.resetToken
      : null

  if (!resetToken) {
    return <Navigate replace to="/auth/forgot-password" />
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({ resetToken, ...data })
      navigate('/auth/login', {
        replace: true,
        state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' },
      })
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Không thể đặt lại mật khẩu',
      })
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-500">Tạo mật khẩu mới cho tài khoản FixNow.</p>
        <form className="mt-7 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <AppInput
            label="Mật khẩu mới"
            type="password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <AppInput
            label="Xác nhận mật khẩu"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
          <AppButton disabled={isSubmitting} size="lg" type="submit">
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </AppButton>
        </form>
        <Link className="mt-5 block text-center text-sm font-medium text-blue-600" to="/auth/login">
          Quay lại đăng nhập
        </Link>
      </section>
    </main>
  )
}
