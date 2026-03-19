import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { FormFieldWrapper, FormGroup } from '~/components/ui/form-control';
import { Text } from '~/components/ui/text';
import { PasswordInput } from '~/features/auth/components/password-input';
import { resetPasswordSchema, type ResetPasswordFormData } from '~/lib/validations';

type Props = {
  loading: boolean;
  serverError?: string;
  onSubmit: (password: string) => void;
  onBack: () => void;
};

export function ForgotResetStep({ loading, serverError, onSubmit, onBack }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handlePress = handleSubmit((data) => {
    onSubmit(data.password);
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      contentContainerStyle={{ padding: 28, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold text-foreground mb-2">Đặt mật khẩu mới</Text>
      <Text className="text-muted-foreground text-sm mb-6 leading-6">
        OTP đã được xác thực. Nhập mật khẩu mới cho tài khoản của bạn.
      </Text>

      <FormGroup>
        {/* New password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <FormFieldWrapper
              label="Mật khẩu mới"
              description="Tối thiểu 8 ký tự · chữ hoa · chữ thường · số"
              error={error?.message}
              required
              className="mb-4"
            >
              <PasswordInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Nhập mật khẩu mới"
                error={!!error}
              />
            </FormFieldWrapper>
          )}
        />

        {/* Confirm password */}
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <FormFieldWrapper label="Xác nhận mật khẩu" error={error?.message} required className="mb-5">
              <PasswordInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Nhập lại mật khẩu mới"
                error={!!error}
              />
            </FormFieldWrapper>
          )}
        />

        {(errors?.root || serverError) && (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-destructive text-sm text-center">
              {errors.root?.message ?? serverError}
            </Text>
          </View>
        )}

        <Button
          variant="brand"
          size="lg"
          className="rounded-xl mb-3"
          onPress={handlePress}
          disabled={loading || isSubmitting}
        >
          <Text className="font-semibold text-white text-base">
            {isSubmitting || loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
          </Text>
        </Button>

        <Button variant="outline" size="lg" className="rounded-xl" onPress={onBack}>
          <Feather name="arrow-left" size={16} color="#6b7280" />
          <Text className="font-medium ml-2">Quay lại</Text>
        </Button>
      </FormGroup>
    </ScrollView>
  );
}
