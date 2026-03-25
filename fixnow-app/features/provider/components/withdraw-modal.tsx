import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { Text } from '~/components/ui/text';
import {
  WithdrawFormFields,
  type WithdrawFormState,
} from './withdraw-form-fields';

const INITIAL: WithdrawFormState = {
  amount: '',
  bankName: '',
  accountNumber: '',
  accountHolder: '',
};

interface Props {
  visible: boolean;
  availableBalance: number;
  onClose: () => void;
  onSubmit: (body: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }) => Promise<void>;
}

export function WithdrawModal({ visible, availableBalance, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<WithdrawFormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

  const handleChange = (key: keyof WithdrawFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    if (submitting) return;
    setForm(INITIAL);
    setFieldError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setFieldError(null);
    const amount = Number(form.amount.replace(/[^0-9]/g, ''));

    if (!amount || amount <= 0) return setFieldError('Vui lòng nhập số tiền hợp lệ.');
    if (amount > availableBalance) return setFieldError(`Số dư khả dụng: ${fmt(availableBalance)}`);
    if (!form.bankName.trim()) return setFieldError('Vui lòng nhập tên ngân hàng.');
    if (!form.accountNumber.trim()) return setFieldError('Vui lòng nhập số tài khoản.');
    if (!form.accountHolder.trim()) return setFieldError('Vui lòng nhập tên chủ tài khoản.');

    try {
      setSubmitting(true);
      await onSubmit({
        amount,
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        accountHolder: form.accountHolder.trim(),
      });
      setForm(INITIAL);
      onClose();
    } catch (err: any) {
      setFieldError(err?.response?.data?.message ?? err?.message ?? 'Gửi yêu cầu thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-5 pb-4 border-b border-zinc-100">
          <Pressable onPress={handleClose} className="p-2 -ml-2 mr-2">
            <Feather name="x" size={22} color="#18181b" />
          </Pressable>
          <Text className="text-lg font-bold text-zinc-900 flex-1">Yêu cầu rút tiền</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <WithdrawFormFields
            form={form}
            availableBalance={availableBalance}
            fieldError={fieldError}
            onChange={handleChange}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className="h-14 rounded-2xl items-center justify-center flex-row gap-2"
            style={{ backgroundColor: submitting ? '#d4d4d8' : '#18181b' }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="send" size={16} color="#fff" />
                <Text className="text-white font-bold text-base">Gửi yêu cầu</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
