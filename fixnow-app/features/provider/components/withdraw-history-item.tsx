import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { WithdrawRequest } from '../services/wallet.service';

const STATUS_CONFIG = {
  PENDING: { label: 'Đang xử lý', color: '#D97706', bg: '#FFFBEB', icon: 'clock' },
  APPROVED: { label: 'Đã duyệt', color: '#059669', bg: '#ECFDF5', icon: 'check-circle' },
  REJECTED: { label: 'Từ chối', color: '#DC2626', bg: '#FFF5F5', icon: 'x-circle' },
} as const;

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

type Props = { item: WithdrawRequest };

export function WithdrawHistoryItem({ item }: Props) {
  const cfg = STATUS_CONFIG[item.status];

  return (
    <View className="bg-white border border-zinc-100 rounded-2xl px-4 py-3 mb-3 shadow-sm">
      {/* Top row: amount + status badge */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-extrabold text-zinc-900">{fmt(item.amount)}</Text>

        <View
          className="flex-row items-center gap-1 rounded-full px-3 py-1"
          style={{ backgroundColor: cfg.bg }}
        >
          <Feather name={cfg.icon as any} size={12} color={cfg.color} />
          <Text className="text-xs font-semibold" style={{ color: cfg.color }}>
            {cfg.label}
          </Text>
        </View>
      </View>

      {/* Bank info */}
      <View className="flex-row items-center gap-2 mb-1">
        <Feather name="credit-card" size={13} color="#9ca3af" />
        <Text className="text-sm text-zinc-500">
          {item.bankName} · {item.accountNumber}
        </Text>
      </View>

      {/* Date */}
      <View className="flex-row items-center gap-2">
        <Feather name="calendar" size={13} color="#9ca3af" />
        <Text className="text-xs text-zinc-400">{fmtDate(item.createdAt)}</Text>
      </View>

      {/* Rejection reason */}
      {item.status === 'REJECTED' && item.rejectReason && (
        <View className="mt-2 bg-red-50 rounded-lg px-3 py-2 flex-row items-start gap-2">
          <Feather name="alert-circle" size={13} color="#DC2626" style={{ marginTop: 1 }} />
          <Text className="text-xs text-red-700 flex-1">{item.rejectReason}</Text>
        </View>
      )}
    </View>
  );
}
