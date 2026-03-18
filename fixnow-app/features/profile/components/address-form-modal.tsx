import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView, Modal, Platform,
  Pressable, Switch, Text as RNText, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '~/components/ui/input';
import { LabelSelector } from '~/features/profile/components/label-selector';
import type { SavedAddress } from '~/features/profile/types';
import { addressSchema, type AddressFormData } from '~/features/profile/validations/schemas';

// ── Field wrapper ─────────────────────────────────────────────────────────────
interface FieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
const FieldWrapper = ({ label, error, required, children }: FieldWrapperProps) => (
  <View style={{ marginBottom: 14 }}>
    <RNText style={{ fontSize: 12, fontWeight: '600', color: '#52525b', marginBottom: 5 }}>
      {label}{required ? <RNText style={{ color: '#ef4444' }}> *</RNText> : null}
    </RNText>
    {children}
    {error ? <RNText style={{ fontSize: 11, color: '#ef4444', marginTop: 3 }}>{error}</RNText> : null}
  </View>
);

// ── Props ─────────────────────────────────────────────────────────────────────
export interface AddressFormModalProps {
  visible: boolean;
  editing: SavedAddress | null;
  onClose: () => void;
  onSave: (data: AddressFormData, id?: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const AddressFormModal = ({ visible, editing, onClose, onSave }: AddressFormModalProps) => {
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<AddressFormData>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        label: 'home', street: '', district: '', city: 'TP. Hồ Chí Minh', isDefault: false,
      },
    });

  useEffect(() => {
    if (!visible) return;
    reset(editing
      ? { label: editing.label, street: editing.street, district: editing.district, city: editing.city, isDefault: editing.isDefault }
      : { label: 'home', street: '', district: '', city: 'TP. Hồ Chí Minh', isDefault: false }
    );
  }, [visible, editing, reset]);

  const isDefault = watch('isDefault');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{
            backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
            paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 20,
          }}>
            {/* Handle bar */}
            <View style={{
              width: 36, height: 4, borderRadius: 2,
              backgroundColor: '#e4e4e7', alignSelf: 'center', marginBottom: 16,
            }} />

            <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b', marginBottom: 18 }}>
              {editing ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </RNText>

            {/* Label */}
            <FieldWrapper label="Loại địa chỉ" required error={errors.label?.message}>
              <Controller
                control={control} name="label"
                render={({ field: { value, onChange } }) => (
                  <LabelSelector value={value} onChange={onChange} />
                )}
              />
            </FieldWrapper>

            {/* Street */}
            <FieldWrapper label="Số nhà, tên đường" required error={errors.street?.message}>
              <Controller
                control={control} name="street"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input value={value} onChangeText={onChange} onBlur={onBlur}
                    placeholder="VD: 123 Nguyễn Trãi, Phường 2"
                    style={errors.street ? { borderColor: '#ef4444' } : undefined}
                  />
                )}
              />
            </FieldWrapper>

            {/* District + City */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FieldWrapper label="Quận / Huyện" required error={errors.district?.message}>
                  <Controller
                    control={control} name="district"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Input value={value} onChangeText={onChange} onBlur={onBlur}
                        placeholder="VD: Quận 5"
                        style={errors.district ? { borderColor: '#ef4444' } : undefined}
                      />
                    )}
                  />
                </FieldWrapper>
              </View>
              <View style={{ flex: 1 }}>
                <FieldWrapper label="Tỉnh / Thành phố" required error={errors.city?.message}>
                  <Controller
                    control={control} name="city"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Input value={value} onChangeText={onChange} onBlur={onBlur}
                        placeholder="TP. Hồ Chí Minh"
                        style={errors.city ? { borderColor: '#ef4444' } : undefined}
                      />
                    )}
                  />
                </FieldWrapper>
              </View>
            </View>

            {/* Default toggle */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 18,
            }}>
              <View>
                <RNText style={{ fontSize: 14, fontWeight: '600', color: '#18181b' }}>
                  Đặt làm mặc định
                </RNText>
                <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>
                  Dùng cho yêu cầu tiếp theo
                </RNText>
              </View>
              <Switch
                value={isDefault}
                onValueChange={(v) => setValue('isDefault', v)}
                trackColor={{ false: '#e4e4e7', true: '#18181b' }}
                thumbColor="#fff"
              />
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={onClose}
                style={{
                  flex: 1, height: 48, borderRadius: 12,
                  borderWidth: 1, borderColor: '#e4e4e7',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <RNText style={{ fontWeight: '600', color: '#52525b' }}>Huỷ</RNText>
              </Pressable>
              <Pressable
                onPress={handleSubmit((data) => onSave(data, editing?.id))}
                style={{
                  flex: 2, height: 48, borderRadius: 12,
                  backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <RNText style={{ color: '#fff', fontWeight: '700' }}>
                  {editing ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
                </RNText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
