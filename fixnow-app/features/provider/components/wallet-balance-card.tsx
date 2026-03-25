import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { ProviderWallet } from '../services/wallet.service';

const BRAND = '#F97316';
const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

type StatChipProps = { label: string; value: string };

function StatChip({ label, value }: StatChipProps) {
  return (
    <View className="flex-1 bg-zinc-800 rounded-xl p-3">
      <Text className="text-[11px] text-zinc-400 mb-1">{label}</Text>
      <Text className="text-sm font-bold text-white">{value}</Text>
    </View>
  );
}

type Props = { wallet: ProviderWallet };

export function WalletBalanceCard({ wallet }: Props) {
  return (
    <View className="mx-4 mb-3 rounded-2xl overflow-hidden bg-zinc-900 p-5">
      <Text className="text-xs text-zinc-400 mb-1 font-medium tracking-wide">
        SỐ DƯ KHẢ DỤNG
      </Text>

      <Text
        className="text-4xl font-extrabold mb-4"
        style={{ color: BRAND, letterSpacing: -1 }}
      >
        {fmt(wallet.balance)}
      </Text>

      <View className="flex-row gap-3">
        <StatChip label="Đang giữ"      value={fmt(wallet.pending)} />
        <StatChip label="Đã kiếm được"  value={fmt(wallet.totalEarned)} />
        <StatChip label="Đã rút"        value={fmt(wallet.totalWithdrawn)} />
      </View>
    </View>
  );
}

// ── Withdraw CTA (wrapped in a Pressable by the parent screen) ────────────────

type CTAProps = { disabled?: boolean; hasPending?: boolean };

export function WithdrawCTA({ disabled, hasPending }: CTAProps) {
  return (
    <View
      className="mx-4 mb-5 flex-row items-center justify-center gap-2 rounded-2xl py-4"
      style={{ backgroundColor: disabled ? '#d4d4d8' : BRAND }}
    >
      <Feather name="arrow-up-circle" size={18} color="#fff" />
      <Text className="text-white font-bold text-base">
        {hasPending ? 'Đang có yêu cầu rút tiền...' : 'Rút tiền'}
      </Text>
    </View>
  );
}
