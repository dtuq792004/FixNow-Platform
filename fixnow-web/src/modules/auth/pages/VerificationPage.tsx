import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import verificationBackground from '../../../assets/background_authen/screen3.png'
import { AuthFooter } from '../components/AuthFooter'
import { MaterialIcon } from '../components/MaterialIcon'
import {
  useForgotPasswordMutation,
  useResendVerificationOtpMutation,
  useVerifyEmailMutation,
  useVerifyOtpMutation,
} from '../hooks/useAuth'
import { otpSchema } from '../validations/authSchemas'

export function VerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const verifyOtpMutation = useVerifyOtpMutation()
  const verifyEmailMutation = useVerifyEmailMutation()
  const resendPasswordOtpMutation = useForgotPasswordMutation()
  const resendEmailOtpMutation = useResendVerificationOtpMutation()
  const [digits, setDigits] = useState(Array(6).fill('') as string[])
  const [seconds, setSeconds] = useState(57)
  const [error, setError] = useState('')
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const email =
    typeof location.state === 'object' &&
    location.state !== null &&
    'email' in location.state &&
    typeof location.state.email === 'string'
      ? location.state.email
      : null
  const purpose =
    typeof location.state === 'object' &&
    location.state !== null &&
    'purpose' in location.state &&
    location.state.purpose === 'email-verification'
      ? 'email-verification'
      : 'password-reset'
  const isEmailVerification = purpose === 'email-verification'

  useEffect(() => {
    if (seconds <= 0) return
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [seconds])

  if (!email) {
    return <Navigate replace to="/auth/forgot-password" />
  }

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((current) => current.map((item, position) => (position === index ? digit : item)))
    setError('')
    if (digit && index < 5) inputsRef.current[index + 1]?.focus()
  }

  const verify = async () => {
    const result = otpSchema.safeParse({ otp: digits.join('') })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Mã OTP không hợp lệ')
      return
    }

    try {
      if (isEmailVerification) {
        await verifyEmailMutation.mutateAsync({ email, otp: result.data.otp })
        navigate('/auth/login', {
          replace: true,
          state: { message: 'Xác thực email thành công. Bạn có thể đăng nhập.' },
        })
      } else {
        const response = await verifyOtpMutation.mutateAsync(result.data.otp)
        navigate('/auth/reset-password', {
          replace: true,
          state: { resetToken: response.resetToken },
        })
      }
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Xác thực OTP thất bại')
    }
  }

  const resend = async () => {
    if (seconds > 0) return

    try {
      if (isEmailVerification) {
        await resendEmailOtpMutation.mutateAsync(email)
      } else {
        await resendPasswordOtpMutation.mutateAsync(email)
      }
      setDigits(Array(6).fill('') as string[])
      setSeconds(57)
      setError('')
      inputsRef.current[0]?.focus()
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Không thể gửi lại OTP')
    }
  }

  return (
    <div className="auth-flow relative h-dvh w-full overflow-hidden bg-surface text-on-surface">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${verificationBackground}')` }} />
        <div className="absolute inset-0 bg-on-background/10 backdrop-blur-sm" />
      </div>

      <main className="relative z-10 flex h-full items-center justify-center p-md">
        <section className="flex w-full max-w-[440px] flex-col items-center gap-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl shadow-xl">
          <div className="flex flex-col items-center gap-base text-center">
            <div className="mb-sm flex items-center gap-xs">
              <MaterialIcon className="text-[32px] text-primary" filled>build_circle</MaterialIcon>
              <h1 className="text-headline-md font-bold tracking-tight text-primary">FixNow</h1>
            </div>
            <h2 className="text-title-lg font-semibold text-on-surface">
              {isEmailVerification ? 'Xác thực email' : 'Xác thực mã OTP'}
            </h2>
            <p className="max-w-[300px] text-body-md text-on-surface-variant">
              Chúng tôi đã gửi mã đến {email}
            </p>
          </div>

          <div className="my-md flex w-full justify-center gap-sm">
            {digits.map((digit, index) => (
              <input
                aria-label={`Chữ số OTP ${index + 1}`}
                autoFocus={index === 0}
                className="otp-input h-14 w-12 rounded-lg border-2 border-outline-variant bg-surface-bright text-center text-headline-md font-semibold outline-none transition-all focus:border-primary focus:ring-0"
                inputMode="numeric"
                key={index}
                maxLength={1}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && !digit && index > 0) inputsRef.current[index - 1]?.focus()
                }}
                ref={(element) => { inputsRef.current[index] = element }}
                type="text"
                value={digit}
              />
            ))}
          </div>
          {error && <p className="-mt-md text-center text-label-sm text-error">{error}</p>}

          <div className="flex w-full flex-col items-center gap-md">
            <button
              className="w-full rounded-full bg-primary py-md text-label-md font-medium text-on-primary shadow-md transition-transform hover:bg-primary-container active:scale-95 disabled:opacity-60"
              disabled={verifyOtpMutation.isPending || verifyEmailMutation.isPending}
              onClick={verify}
              type="button"
            >
              {verifyOtpMutation.isPending || verifyEmailMutation.isPending
                ? 'Đang xác thực...'
                : 'Xác nhận'}
            </button>
            <p className="text-label-sm text-on-surface-variant">
              Bạn chưa nhận được mã?{' '}
              <button
                className={`font-bold text-primary hover:underline ${seconds > 0 ? 'pointer-events-none opacity-70' : ''}`}
                disabled={resendPasswordOtpMutation.isPending || resendEmailOtpMutation.isPending}
                onClick={resend}
                type="button"
              >
                {seconds > 0 ? `Gửi lại mã (sau ${seconds}s)` : 'Gửi lại ngay'}
              </button>
            </p>
            <Link className="flex items-center gap-xs text-label-md text-outline hover:text-on-surface" to="/auth/login">
              <MaterialIcon className="text-[18px]">arrow_back</MaterialIcon>
              Quay lại
            </Link>
          </div>
        </section>
      </main>
      <AuthFooter />
    </div>
  )
}
