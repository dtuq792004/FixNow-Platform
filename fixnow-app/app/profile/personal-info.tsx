import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Alert, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '~/components/ui/input';
import { useUser } from '~/features/auth/stores/auth.store';
import { useAuthStore } from '~/features/auth/stores/auth.store';
import { updateProfileApi } from '~/features/profile/services/user.service';
import {
  personalInfoSchema,
  type PersonalInfoFormData,
} from '~/features/profile/validations/schemas';

// ── Reusable field wrapper ────────────────────────────────────────────────────
interface FieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
const FieldWrapper = ({ label, error, required, children }: FieldWrapperProps) => (
  <View style={{ marginBottom: 18 }}>
    <RNText style={{ fontSize: 13, fontWeight: '600', color: '#52525b', marginBottom: 6 }}>
      {label}{required ? <RNText style={{ color: '#ef4444' }}> *</RNText> : null}
    </RNText>
    {children}
    {error ? (
      <RNText style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</RNText>
    ) : null}
  </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
const PersonalInfoScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const setUser = useAuthStore((s) => s.setUser);

  const { control, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } =
    useForm<PersonalInfoFormData>({
      resolver: zodResolver(personalInfoSchema),
      defaultValues: { fullName: user?.fullName ?? '', phone: user?.phone ?? '' },
    });

  // Sync form when user data changes
  useEffect(() => {
    reset({ fullName: user?.fullName ?? '', phone: user?.phone ?? '' });
  }, [user, reset]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    if (!user) return;
    try {
      const updated = await updateProfileApi({ fullName: data.fullName, phone: data.phone ?? '' });
      setUser({ ...user, ...updated });
      Alert.alert('Đã lưu', 'Thông tin cá nhân đã được cập nhật.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message ?? 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8, paddingBottom: 12,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <RNText style={{ fontSize: 17, fontWeight: '700', color: '#18181b', flex: 1 }}>
          Thông tin cá nhân
        </RNText>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar preview */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center',
          }}>
            <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 24 }}>
              {(user?.fullName ?? user?.email ?? '?').slice(0, 1).toUpperCase()}
            </RNText>
          </View>
        </View>

        {/* ── Form fields ──────────────────────────────────────────────────── */}
        <FieldWrapper label="Họ và tên" required error={errors.fullName?.message}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Nguyễn Văn An"
                autoCapitalize="words"
                style={errors.fullName ? { borderColor: '#ef4444' } : undefined}
              />
            )}
          />
        </FieldWrapper>

        <FieldWrapper label="Số điện thoại" error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="0901 234 567"
                keyboardType="phone-pad"
                maxLength={11}
                style={errors.phone ? { borderColor: '#ef4444' } : undefined}
              />
            )}
          />
        </FieldWrapper>

        {/* Email — readonly */}
        <FieldWrapper label="Email">
          <View style={{
            height: 48, borderRadius: 8, borderWidth: 1,
            borderColor: '#e4e4e7', backgroundColor: '#f9f9f9',
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 12, gap: 8,
          }}>
            <RNText style={{ flex: 1, fontSize: 15, color: '#a1a1aa' }} numberOfLines={1}>
              {user?.email}
            </RNText>
            <Feather name="lock" size={14} color="#d4d4d8" />
          </View>
          <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>
            Email không thể thay đổi
          </RNText>
        </FieldWrapper>

        {/* Save button */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || isSubmitting}
          style={{
            height: 50, borderRadius: 12,
            backgroundColor: isDirty && !isSubmitting ? '#18181b' : '#d4d4d8',
            alignItems: 'center', justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </RNText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default PersonalInfoScreen;
