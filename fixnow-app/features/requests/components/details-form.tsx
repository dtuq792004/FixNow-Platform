import { Text as RNText, ScrollView, View } from 'react-native';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Text } from '~/components/ui/text';
import type { CreateRequestSchema } from '~/features/requests/validations/create-request.schema';

interface DetailsFormProps {
  control: Control<CreateRequestSchema>;
  errors: FieldErrors<CreateRequestSchema>;
}

interface FormRowProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

const FormRow = ({ label, required, error, hint, children }: FormRowProps) => (
  <View style={{ marginBottom: 20 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      <RNText style={{ fontSize: 14, fontWeight: '600', color: '#18181b' }}>{label}</RNText>
      {required && (
        <RNText style={{ fontSize: 14, color: '#ef4444', marginLeft: 2 }}> *</RNText>
      )}
    </View>
    {children}
    {hint && !error && (
      <RNText style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>{hint}</RNText>
    )}
    {error && (
      <Text className="text-destructive text-xs mt-1">{error}</Text>
    )}
  </View>
);

export const DetailsForm = ({ control, errors }: DetailsFormProps) => (
  <ScrollView
    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    <View style={{ marginBottom: 24 }}>
      <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b', marginBottom: 4 }}>
        Mô tả vấn đề
      </RNText>
      <RNText style={{ fontSize: 14, color: '#71717a' }}>
        Cung cấp thông tin để thợ hiểu rõ công việc cần làm
      </RNText>
    </View>

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

    {/* Address */}
    <FormRow
      label="Địa chỉ"
      required
      error={errors.address?.message}
      hint='Vd: "123 Nguyễn Trãi, P.2, Q.5, TP.HCM"'
    >
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Nhập địa chỉ cần hỗ trợ..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            className={errors.address ? 'border-destructive' : ''}
            returnKeyType="next"
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
