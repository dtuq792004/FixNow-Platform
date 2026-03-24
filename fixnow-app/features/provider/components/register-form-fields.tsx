/**
 * Form fields for provider registration.
 * Receives react-hook-form control + submit handler from the parent screen.
 */
import { Feather } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Pressable, Text as RNText, TextInput, View } from 'react-native';
import type { AuthUser } from '~/features/auth/types/auth.types';
import { SpecialtySelector } from '~/features/provider/components/specialty-selector';
import {
  FieldWrapper, InfoRow, SectionHeader,
} from '~/features/provider/components/provider-form-ui';
import type { RegisterProviderFormData } from '~/features/provider/validations/schemas';

interface RegisterFormFieldsProps {
  control: Control<RegisterProviderFormData>;
  errors: FieldErrors<RegisterProviderFormData>;
  setValue: UseFormSetValue<RegisterProviderFormData>;
  selectedSpecialties: string[];
  user: AuthUser;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const RegisterFormFields = ({
  control, errors, setValue, selectedSpecialties,
  user, isSubmitting, onSubmit,
}: RegisterFormFieldsProps) => (
  <>
    {/* ── Thông tin cơ bản ──────────────────────────────────── */}
    <SectionHeader title="Thông tin cơ bản" />
    
    {/* Full Name Input */}
    <FieldWrapper
      label="Họ và tên" required
      error={errors.fullName?.message}
    >
      <Controller
        control={control} name="fullName"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value} onChangeText={onChange} onBlur={onBlur}
            placeholder="Nhập họ và tên của bạn"
            style={{
              height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
              borderColor: errors.fullName ? '#ef4444' : '#e4e4e7',
              fontSize: 14, color: '#18181b', backgroundColor: '#fff',
            }}
          />
        )}
      />
    </FieldWrapper>

    {/* Phone Input */}
    <FieldWrapper
      label="Số điện thoại" required
      error={errors.phone?.message}
    >
      <Controller
        control={control} name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value} onChangeText={onChange} onBlur={onBlur}
            placeholder="Nhập số điện thoại của bạn"
            keyboardType="phone-pad"
            style={{
              height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
              borderColor: errors.phone ? '#ef4444' : '#e4e4e7',
              fontSize: 14, color: '#18181b', backgroundColor: '#fff',
            }}
          />
        )}
      />
    </FieldWrapper>

    {/* Email (readonly) */}
    <InfoRow icon="mail" label="Email" value={user.email} />

    {/* ── Chuyên môn ───────────────────────────────────────────────────── */}
    <SectionHeader title="Chuyên môn" />
    <FieldWrapper label="Lĩnh vực bạn có kinh nghiệm" required error={errors.specialties?.message}>
      <SpecialtySelector
        value={selectedSpecialties}
        onChange={(v) => setValue('specialties', v, { shouldValidate: true })}
        error={errors.specialties?.message}
      />
    </FieldWrapper>

    {/* ── Kinh nghiệm & khu vực ─────────────────────────────────────────── */}
    <SectionHeader title="Kinh nghiệm & Khu vực" />
    <FieldWrapper
      label="Kinh nghiệm làm việc" required
      error={errors.experience?.message}
      hint="VD: 3 năm sửa điện dân dụng, từng làm tại công ty điện XYZ"
    >
      <Controller
        control={control} name="experience"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value} onChangeText={onChange} onBlur={onBlur}
            placeholder="Mô tả kinh nghiệm của bạn..."
            multiline numberOfLines={3} textAlignVertical="top"
            style={{
              borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 80,
              borderColor: errors.experience ? '#ef4444' : '#e4e4e7',
              fontSize: 14, color: '#18181b', backgroundColor: '#fff',
            }}
          />
        )}
      />
    </FieldWrapper>

    <FieldWrapper
      label="Khu vực hoạt động" required
      error={errors.serviceArea?.message}
      hint="VD: Quận 1, Quận 3, Quận 5 — TP. Hồ Chí Minh"
    >
      <Controller
        control={control} name="serviceArea"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value} onChangeText={onChange} onBlur={onBlur}
            placeholder="Nhập khu vực bạn có thể nhận việc"
            style={{
              height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
              borderColor: errors.serviceArea ? '#ef4444' : '#e4e4e7',
              fontSize: 14, color: '#18181b', backgroundColor: '#fff',
            }}
          />
        )}
      />
    </FieldWrapper>

    {/* ── Giấy tờ ──────────────────────────────────────────────────────── */}
    <SectionHeader title="Giấy tờ xác thực" />
    <FieldWrapper
      label="Số CCCD / CMND" required
      error={errors.idCard?.message}
      hint="9 chữ số (CMND cũ) hoặc 12 chữ số (CCCD mới)"
    >
      <Controller
        control={control} name="idCard"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value} onChangeText={onChange} onBlur={onBlur}
            placeholder="VD: 012345678901"
            keyboardType="number-pad" maxLength={12}
            style={{
              height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
              borderColor: errors.idCard ? '#ef4444' : '#e4e4e7',
              fontSize: 14, color: '#18181b', backgroundColor: '#fff',
            }}
          />
        )}
      />
    </FieldWrapper>

    {/* ── Mô tả thêm (optional) ────────────────────────────────────────── */}
    <SectionHeader title="Thêm thông tin (tuỳ chọn)" />
    <FieldWrapper label="Lý do bạn muốn trở thành thợ FixNow" error={errors.motivation?.message}>
      <Controller
        control={control} name="motivation"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value ?? ''} onChangeText={onChange} onBlur={onBlur}
            placeholder="Chia sẻ thêm về bạn và lý do muốn tham gia..."
            multiline numberOfLines={3} textAlignVertical="top"
            style={{
              borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 80,
              borderColor: '#e4e4e7', fontSize: 14, color: '#18181b', backgroundColor: '#fff',
            }}
          />
        )}
      />
    </FieldWrapper>

    {/* Terms notice */}
    <View style={{
      backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12,
      marginBottom: 20, flexDirection: 'row', gap: 8,
    }}>
      <Feather name="info" size={14} color="#a1a1aa" style={{ marginTop: 1 }} />
      <RNText style={{ fontSize: 11, color: '#71717a', flex: 1, lineHeight: 16 }}>
        Bằng cách nộp đơn, bạn đồng ý với{' '}
        <RNText style={{ color: '#18181b', fontWeight: '700' }}>Điều khoản dịch vụ</RNText>
        {' '}và{' '}
        <RNText style={{ color: '#18181b', fontWeight: '700' }}>Chính sách thợ kỹ thuật</RNText>
        {' '}của FixNow.
      </RNText>
    </View>

    {/* Submit button */}
    <Pressable
      onPress={onSubmit}
      disabled={isSubmitting}
      style={{
        height: 52, borderRadius: 14,
        backgroundColor: isSubmitting ? '#d4d4d8' : '#18181b',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <Feather name="send" size={16} color="#fff" />
      <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
        {isSubmitting ? 'Đang gửi...' : 'Nộp đơn đăng ký'}
      </RNText>
    </Pressable>
  </>
);
