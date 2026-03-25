import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';

interface WithdrawFormState {
  amount: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface Props {
  form: WithdrawFormState;
  availableBalance: number;
  fieldError: string | null;
  onChange: (key: keyof WithdrawFormState, value: string) => void;
}

const FieldLabel = ({ children }: { children: string }) => (
  <Text className="text-sm font-semibold text-zinc-700 mb-1">{children}</Text>
);

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const BRAND = '#F97316';

export function WithdrawFormFields({ form, availableBalance, fieldError, onChange }: Props) {
  return (
    <>
      {/* Balance indicator */}
      <View className="bg-zinc-50 rounded-xl px-4 py-3 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name="info" size={14} color="#9ca3af" />
          <Text className="text-sm text-zinc-500">Số dư khả dụng</Text>
        </View>
        <Text className="text-base font-bold" style={{ color: BRAND }}>
          {fmt(availableBalance)}
        </Text>
      </View>

      <View className="mb-4">
        <FieldLabel>Số tiền muốn rút *</FieldLabel>
        <Input
          value={form.amount}
          onChangeText={(v) => onChange('amount', v)}
          placeholder="VD: 500000"
          keyboardType="number-pad"
          className="h-12 text-base"
        />
      </View>

      <View className="mb-4">
        <FieldLabel>Tên ngân hàng *</FieldLabel>
        <Input
          value={form.bankName}
          onChangeText={(v) => onChange('bankName', v)}
          placeholder="VD: Vietcombank, MB Bank..."
          className="h-12 text-base"
        />
      </View>

      <View className="mb-4">
        <FieldLabel>Số tài khoản *</FieldLabel>
        <Input
          value={form.accountNumber}
          onChangeText={(v) => onChange('accountNumber', v)}
          placeholder="Nhập số tài khoản"
          keyboardType="number-pad"
          className="h-12 text-base"
        />
      </View>

      <View className="mb-5">
        <FieldLabel>Tên chủ tài khoản *</FieldLabel>
        <Input
          value={form.accountHolder}
          onChangeText={(v) => onChange('accountHolder', v)}
          placeholder="Nhập tên chủ tài khoản (in hoa)"
          autoCapitalize="characters"
          className="h-12 text-base"
        />
      </View>

      {fieldError && (
        <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-start gap-2">
          <Feather name="alert-circle" size={15} color="#DC2626" style={{ marginTop: 1 }} />
          <Text className="text-red-700 text-sm flex-1">{fieldError}</Text>
        </View>
      )}

      <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex-row items-start gap-2">
        <Feather name="clock" size={14} color="#D97706" style={{ marginTop: 1 }} />
        <Text className="text-amber-800 text-xs flex-1 leading-5">
          Yêu cầu sẽ được xử lý trong 1–3 ngày làm việc. Tiền sẽ được chuyển vào tài khoản sau khi được duyệt.
        </Text>
      </View>
    </>
  );
}

export type { WithdrawFormState };
