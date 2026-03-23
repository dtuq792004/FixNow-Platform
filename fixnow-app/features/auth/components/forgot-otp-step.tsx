import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { FormFieldWrapper, FormGroup } from '~/components/ui/form-control';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { otpSchema, type OtpFormData } from '~/lib/validations';

const BRAND = '#F97316';

type Props = {
  loading: boolean;
  userEmail: string;
  serverError?: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
};

export function ForgotOtpStep({ loading, userEmail, serverError, onSubmit, onResend, onBack }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const handlePress = handleSubmit((data) => {
    onSubmit(data.otp);
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      contentContainerStyle={{ padding: 28, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold text-foreground mb-2">Nhập mã OTP</Text>

      {/* Email notice */}
      <View className="flex-row items-center mb-6">
        <Feather name="mail" size={14} color="#6b7280" style={{ marginRight: 6 }} />
        <Text className="text-muted-foreground text-sm flex-1 leading-5">
          Mã OTP đã được gửi tới{' '}
          <Text className="font-semibold text-foreground">{userEmail}</Text>
        </Text>
      </View>

      {/* OTP info banner */}
      <View className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 flex-row items-start">
        <Feather name="clock" size={15} color={BRAND} style={{ marginTop: 1, marginRight: 8 }} />
        <Text className="text-sm leading-5 flex-1" style={{ color: '#92400e' }}>
          Mã OTP có hiệu lực trong <Text className="font-semibold">15 phút</Text>.{' '}
          Kiểm tra cả thư mục Spam nếu không thấy email.
        </Text>
      </View>

      <FormGroup>
        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <FormFieldWrapper
              label="Mã OTP"
              error={error?.message}
              required
              className="mb-5"
            >
              <Input
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
                onBlur={onBlur}
                placeholder="Nhập 6 chữ số"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                className={error ? 'border-destructive' : undefined}
                style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
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
            {isSubmitting || loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
          </Text>
        </Button>

        {/* Resend */}
        <Button variant="ghost" size="lg" className="rounded-xl mb-2" onPress={onResend} disabled={loading}>
          <Feather name="refresh-cw" size={15} color="#6b7280" />
          <Text className="text-muted-foreground font-medium ml-2">Gửi lại mã OTP</Text>
        </Button>

        <Button variant="outline" size="lg" className="rounded-xl" onPress={onBack}>
          <Feather name="arrow-left" size={16} color="#6b7280" />
          <Text className="font-medium ml-2">Quay lại</Text>
        </Button>
      </FormGroup>
    </ScrollView>
  );
}
