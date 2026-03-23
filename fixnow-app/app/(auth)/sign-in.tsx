import { zodResolver } from '@hookform/resolvers/zod';
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
import { useAuthLoading, useSignIn } from '~/features/auth/stores/auth.store';
import { mapAuthError } from '~/features/auth/utils/auth-errors';
import { signInSchema, type SignInFormData } from '~/lib/validations';

const BRAND = '#F97316';

export default function SignInScreen() {
  const signIn = useSignIn();
  const loading = useAuthLoading();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { emailAddress: '', password: '' },
  });

  const onSubmit = async (data: SignInFormData) => {
    const { error } = await signIn(data.emailAddress, data.password);
    if (error) {
      setError('root', { message: mapAuthError(error).message });
    } else {
      router.replace('/');
    }
  };

  const navigate = (to: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace(to as never);
    setTimeout(() => setIsNavigating(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <AuthHero subtitle={'Chào mừng trở lại!\nĐăng nhập để quản lý yêu cầu sửa chữa.'} />

        <ScrollView
          style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
          contentContainerStyle={{ padding: 28, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-2xl font-bold text-foreground mb-6">Đăng nhập</Text>

          <FormGroup>
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
                <FormFieldWrapper label="Mật khẩu" error={error?.message} required className="mb-2">
                  <PasswordInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Nhập mật khẩu"
                    error={!!error}
                  />
                </FormFieldWrapper>
              )}
            />

            {/* Forgot password */}
            <View className="flex-row justify-end mb-5">
              <Text
                className="text-sm font-medium"
                style={{ color: BRAND }}
                onPress={() => navigate('/(auth)/forgot-password')}
                suppressHighlighting
              >
                Quên mật khẩu?
              </Text>
            </View>

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
                {isSubmitting || loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Text>
            </Button>

            {/* Sign up link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-muted-foreground text-sm">Chưa có tài khoản? </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: BRAND }}
                onPress={() => navigate('/sign-up')}
                suppressHighlighting
              >
                Đăng ký ngay
              </Text>
            </View>
          </FormGroup>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
