import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { FormFieldWrapper, FormGroup } from '~/components/ui/form-control';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '~/lib/validations';

const BRAND = '#F97316';

type Props = {
  loading: boolean;
  onSubmit: (email: string) => void;
  onBack: () => void;
};

export function ForgotRequestStep({ loading, onSubmit, onBack }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { emailAddress: '' },
  });

  const handlePress = handleSubmit((data) => {
    onSubmit(data.emailAddress);
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      contentContainerStyle={{ padding: 28, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold text-foreground mb-2">Quên mật khẩu?</Text>
      <Text className="text-muted-foreground text-sm mb-6 leading-6">
        Nhập email để nhận hướng dẫn đặt lại mật khẩu.
      </Text>

      <FormGroup>
        <Controller
          control={control}
          name="emailAddress"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <FormFieldWrapper label="Email" error={error?.message} required className="mb-5">
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

        {errors?.root && (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-destructive text-sm text-center">{errors.root.message}</Text>
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
            {isSubmitting || loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
          </Text>
        </Button>

        <Button variant="outline" size="lg" className="rounded-xl" onPress={onBack}>
          <Feather name="arrow-left" size={16} color="#6b7280" />
          <Text className="font-medium ml-2">Quay lại đăng nhập</Text>
        </Button>
      </FormGroup>
    </ScrollView>
  );
}
