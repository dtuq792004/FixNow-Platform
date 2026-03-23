import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { AuthHero } from '~/features/auth/components/auth-hero';
import { ForgotOtpStep } from '~/features/auth/components/forgot-otp-step';
import { ForgotRequestStep } from '~/features/auth/components/forgot-request-step';
import { ForgotResetStep } from '~/features/auth/components/forgot-reset-step';
import { ForgotSuccessStep } from '~/features/auth/components/forgot-success-step';
import {
  useAuthLoading,
  useRequestPasswordReset,
  useResetPassword,
  useVerifyOtp,
} from '~/features/auth/stores/auth.store';
import { mapAuthError } from '~/features/auth/utils/auth-errors';

const BRAND = '#F97316';
type Step = 'request' | 'otp' | 'reset' | 'success';

const HERO_SUBTITLES: Record<Step, string> = {
  request: 'Không sao! Nhập email để nhận\nmã OTP đặt lại mật khẩu.',
  otp: 'Kiểm tra email và nhập\nmã OTP 6 chữ số của bạn.',
  reset: 'OTP xác thực thành công!\nNhập mật khẩu mới để tiếp tục.',
  success: 'Mật khẩu đã được cập nhật.\nĐăng nhập để tiếp tục.',
};

export default function ForgotPasswordScreen() {
  const requestPasswordReset = useRequestPasswordReset();
  const verifyOtp = useVerifyOtp();
  const resetPassword = useResetPassword();
  const loading = useAuthLoading();
  const router = useRouter();

  const [step, setStep] = React.useState<Step>('request');
  const [userEmail, setUserEmail] = React.useState('');
  const [resetToken, setResetToken] = React.useState('');
  const [otpError, setOtpError] = React.useState('');
  const [resetError, setResetError] = React.useState('');
  const [isNavigating, setIsNavigating] = React.useState(false);

  const goToSignIn = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace('/(auth)/sign-in');
    setTimeout(() => setIsNavigating(false), 1000);
  };

  // Step 1: gửi OTP đến email
  const handleRequestReset = async (email: string) => {
    const { error } = await requestPasswordReset(email);
    if (!error) {
      setUserEmail(email);
      setOtpError('');
      setStep('otp');
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    await requestPasswordReset(userEmail);
  };

  // Step 2: xác thực OTP → nhận resetToken từ backend
  const handleVerifyOtp = async (otp: string) => {
    setOtpError('');
    const { resetToken: token, error } = await verifyOtp(otp);
    if (error) {
      setOtpError(mapAuthError(error).message);
      return;
    }
    if (token) {
      setResetToken(token);
      setResetError('');
      setStep('reset');
    }
  };

  // Step 3: đặt lại mật khẩu với resetToken đã lưu
  const handleResetPassword = async (newPassword: string) => {
    setResetError('');
    const { error } = await resetPassword(resetToken, newPassword);
    if (error) {
      setResetError(mapAuthError(error).message);
      return;
    }
    setStep('success');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <AuthHero subtitle={HERO_SUBTITLES[step]} />

        {step === 'request' && (
          <ForgotRequestStep
            loading={loading}
            onSubmit={handleRequestReset}
            onBack={goToSignIn}
          />
        )}

        {step === 'otp' && (
          <ForgotOtpStep
            loading={loading}
            userEmail={userEmail}
            serverError={otpError}
            onSubmit={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={() => setStep('request')}
          />
        )}

        {step === 'reset' && (
          <ForgotResetStep
            loading={loading}
            serverError={resetError}
            onSubmit={handleResetPassword}
            onBack={() => setStep('otp')}
          />
        )}

        {step === 'success' && (
          <ForgotSuccessStep onSignIn={goToSignIn} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
