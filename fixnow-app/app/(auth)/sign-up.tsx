import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { FormFieldWrapper, FormGroup } from '~/components/ui/form-control';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { AuthHero } from '~/features/auth/components/auth-hero';
import { PasswordInput } from '~/features/auth/components/password-input';
import { useAuthLoading, useSignUp } from '~/features/auth/stores/auth.store';
import { mapAuthError } from '~/features/auth/utils/auth-errors';
import { signUpSchema, type SignUpFormData } from '~/lib/validations';

const BRAND = '#F97316';

// ── Success state ─────────────────────────────────────────────────────────────
function SignUpSuccess({ email, onSignIn }: { email: string; onSignIn: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND }}>
      <AuthHero subtitle={'Tài khoản đã được tạo thành công!\nBắt đầu đặt lịch sửa chữa ngay.'} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
        contentContainerStyle={{ padding: 28, paddingBottom: 48 }}
      >
        <View className="items-center mb-8 mt-4">
          <View
            style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
          >
            <Feather name="check-circle" size={36} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2">Đăng ký thành công!</Text>
          <Text className="text-muted-foreground text-sm text-center leading-6">
            Tài khoản <Text className="font-semibold text-foreground">{email}</Text>
            {'\n'}đã được tạo. Bạn có thể đăng nhập ngay.
          </Text>
        </View>

        <Button variant="brand" size="lg" className="rounded-xl" onPress={onSignIn}>
          <Text className="font-semibold text-white text-base">Đăng nhập ngay</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sign Up form ──────────────────────────────────────────────────────────────
export default function SignUpScreen() {
  const signUp = useSignUp();
  const loading = useAuthLoading();
  const router = useRouter();
  const [successEmail, setSuccessEmail] = React.useState('');
  const [isNavigating, setIsNavigating] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', emailAddress: '', password: '' },
  });

  const onSubmit = async (data: SignUpFormData) => {
    const { error } = await signUp(data.emailAddress, data.password, data.fullName);
    if (error) {
      setError('root', { message: mapAuthError(error).message });
    } else {
      setSuccessEmail(data.emailAddress);
    }
  };

  const navigate = (to: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace(to as never);
    setTimeout(() => setIsNavigating(false), 1000);
  };

  if (successEmail) {
    return <SignUpSuccess email={successEmail} onSignIn={() => navigate('/sign-in')} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <AuthHero subtitle={'Tạo tài khoản để đặt lịch\nsửa chữa nhanh chóng, tiện lợi.'} />

        <ScrollView
          style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
          contentContainerStyle={{ padding: 28, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-2xl font-bold text-foreground mb-6">Tạo tài khoản</Text>

          <FormGroup>
            {/* Full name */}
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FormFieldWrapper label="Họ và tên" error={error?.message} required className="mb-4">
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Nhập họ và tên"
                    autoCapitalize="words"
                    className={error ? 'border-destructive' : undefined}
                  />
                </FormFieldWrapper>
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="emailAddress"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FormFieldWrapper label="Email" error={error?.message} required className="mb-4">
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Nhập email của bạn"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className={error ? 'border-destructive' : undefined}
                  />
                </FormFieldWrapper>
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FormFieldWrapper
                  label="Mật khẩu"
                  error={error?.message}
                  description="Tối thiểu 8 ký tự · chữ hoa · chữ thường · số"
                  required
                  className="mb-5"
                >
                  <PasswordInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Tạo mật khẩu"
                    error={!!error}
                  />
                </FormFieldWrapper>
              )}
            />

            {/* Root error */}
            {errors?.root && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <Text className="text-destructive text-sm text-center">{errors.root.message}</Text>
              </View>
            )}

            {/* CTA */}
            <Button
              variant="brand"
              size="lg"
              className="rounded-xl mb-5"
              onPress={handleSubmit(onSubmit)}
              disabled={loading || isSubmitting}
            >
              <Text className="font-semibold text-white text-base">
                {isSubmitting || loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Text>
            </Button>

            {/* Sign in link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-muted-foreground text-sm">Đã có tài khoản? </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: BRAND }}
                onPress={() => navigate('/sign-in')}
                suppressHighlighting
              >
                Đăng nhập
              </Text>
            </View>
          </FormGroup>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
