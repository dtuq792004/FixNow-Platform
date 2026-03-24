import { useEffect } from 'react';
import { Text as RNText, ScrollView, View } from 'react-native';
import type { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Text } from '~/components/ui/text';
import { fetchAddresses } from '~/features/profile/services/address.service';
import type { CreateRequestSchema } from '~/features/requests/validations/create-request.schema';
import type { ServiceCategoryType } from '~/features/home/types';
import { formatSavedAddress } from '../utils/address-format.utils';
import { AddressPicker } from './address-picker';
import { ServicePicker } from './service-picker';

interface DetailsFormProps {
  control: Control<CreateRequestSchema>;
  errors: FieldErrors<CreateRequestSchema>;
  setValue: UseFormSetValue<CreateRequestSchema>;
  category: ServiceCategoryType;
}

interface FormRowProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

const FormRow = ({ label, required, error, hint, children }: FormRowProps) => (
  <View className="mb-5">
    <View className="flex-row items-center mb-1.5">
      <RNText className="text-sm font-semibold text-zinc-900">{label}</RNText>
      {required && <RNText className="text-sm text-red-500 ml-0.5"> *</RNText>}
    </View>
    {children}
    {hint && !error && <RNText className="text-xs text-zinc-400 mt-1">{hint}</RNText>}
    {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
  </View>
);

export const DetailsForm = ({ control, errors, setValue, category }: DetailsFormProps) => {
  // Auto-fill default address on first render (only when address is still empty)
  useEffect(() => {
    const currentAddress = control._formValues.address ?? '';
    if (currentAddress.trim() !== '') return;

    fetchAddresses()
      .then((addresses) => {
        const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (defaultAddr) {
          setValue('address', formatSavedAddress(defaultAddr), { shouldValidate: true });
          setValue('addressId', defaultAddr.id);
        }
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Section heading */}
      <View className="mb-6">
        <RNText className="text-xl font-bold text-zinc-900 mb-1">Mô tả vấn đề</RNText>
        <RNText className="text-sm text-zinc-500">
          Cung cấp thông tin để thợ hiểu rõ công việc cần làm
        </RNText>
      </View>

      {/* Service Picker */}
      <Controller
        control={control}
        name="serviceId"
        render={({ field: { value } }) => (
          <ServicePicker
            category={category}
            selectedServiceId={value}
            selectedServiceName={control._formValues.serviceName}
            onSelect={(svc) => {
              setValue('serviceId', svc?.id ?? undefined);
              setValue('serviceName', svc?.name ?? undefined);
              setValue('servicePrice', svc?.price ?? undefined);
              setValue('serviceUnit', svc?.unit ?? undefined);
            }}
          />
        )}
      />

      {/* Title */}
      <FormRow
        label="Tiêu đề yêu cầu"
        required
        error={errors.title?.message}
        hint='Vd: "Đèn phòng khách bị chập, cần thay mới"'
      >
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Tóm tắt vấn đề cần sửa..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              className={errors.title ? 'border-destructive' : ''}
              returnKeyType="next"
              maxLength={100}
            />
          )}
        />
      </FormRow>

      {/* Description */}
      <FormRow
        label="Mô tả chi tiết"
        required
        error={errors.description?.message}
        hint="Mô tả càng chi tiết, thợ tư vấn càng chính xác"
      >
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              placeholder="Mô tả tình trạng hỏng hóc, lần cuối hoạt động tốt khi nào, triệu chứng gặp phải..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              className={errors.description ? 'border-destructive' : ''}
              style={{ minHeight: 110 }}
              maxLength={500}
            />
          )}
        />
      </FormRow>

      {/* Address — AddressPicker (saved list + manual fallback) */}
      <FormRow label="Địa chỉ" required error={errors.address?.message}>
        <Controller
          control={control}
          name="address"
          render={({ field: { value } }) => (
            <AddressPicker
              value={value}
              addressId={control._formValues.addressId}
              onAddressChange={(text, id) => {
                setValue('address', text, { shouldValidate: true });
                setValue('addressId', id ?? undefined);
              }}
              error={errors.address?.message}
            />
          )}
        />
      </FormRow>

      {/* Note (optional) */}
      <FormRow
        label="Ghi chú thêm"
        error={errors.note?.message}
        hint="Thời gian rảnh, yêu cầu đặc biệt,..."
      >
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              placeholder="Ghi chú tuỳ chọn..."
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              style={{ minHeight: 80 }}
              maxLength={200}
            />
          )}
        />
      </FormRow>
    </ScrollView>
  );
};
