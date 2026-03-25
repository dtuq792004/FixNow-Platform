import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { useProviderWallet } from '~/features/provider/hooks/use-provider-wallet';
import { WalletBalanceCard, WithdrawCTA } from '~/features/provider/components/wallet-balance-card';
import { WithdrawHistoryItem } from '~/features/provider/components/withdraw-history-item';
import { WithdrawModal } from '~/features/provider/components/withdraw-modal';
import type { WithdrawRequest } from '~/features/provider/services/wallet.service';

const BRAND = '#F97316';

// ── Empty history state ───────────────────────────────────────────────────────

function HistoryEmpty() {
  return (
    <View className="items-center py-12 px-8">
      <Feather name="inbox" size={36} color="#d4d4d8" />
      <Text className="text-sm text-zinc-400 mt-3 text-center">
        Chưa có lịch sử rút tiền
      </Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProviderWalletScreen() {
  const insets = useSafeAreaInsets();
  const {
    wallet,
    history,
    loading,
    historyLoading,
    error,
    loadAll,
    submitWithdraw,
  } = useProviderWallet();

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const hasPending = history.some((r) => r.status === 'PENDING');
  const canWithdraw = !!wallet && wallet.balance > 0 && !hasPending;

  // ── Loading skeleton ─────────────────────────────────────────────────────

  if (loading && !wallet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={BRAND} />
        <Text className="text-sm text-muted-foreground mt-3">Đang tải ví...</Text>
      </View>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (error && !wallet) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Feather name="wifi-off" size={36} color="#d4d4d8" />
        <Text className="text-base font-bold text-zinc-700 mt-4 mb-2 text-center">
          Không thể tải ví
        </Text>
        <Text className="text-sm text-zinc-400 text-center mb-6">{error}</Text>
        <Pressable
          onPress={loadAll}
          className="bg-zinc-900 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header — uses insets.top consistent with rest of the codebase */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-4 pb-3 border-b border-zinc-100"
      >
        <Text className="text-2xl font-bold text-foreground py-1">Ví của tôi</Text>
      </View>

      <FlatList<WithdrawRequest>
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // mx-4 aligns history items with the balance card
          <View className="mx-4">
            <WithdrawHistoryItem item={item} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BRAND} />
        }
        ListHeaderComponent={
          <>
            {/* Balance card — card itself has mx-4 */}
            {wallet && (
              <View className="mt-4">
                <WalletBalanceCard wallet={wallet} />
              </View>
            )}

            {/* Withdraw CTA — mx-4 aligns with the card */}
            <Pressable
              onPress={() => canWithdraw && setModalVisible(true)}
              disabled={!canWithdraw}
              className="mx-4"
              accessibilityRole="button"
              accessibilityLabel="Rút tiền"
            >
              <WithdrawCTA disabled={!canWithdraw} hasPending={hasPending} />
            </Pressable>

            {/* History section header */}
            <View className="flex-row items-center justify-between mx-4 mb-3">
              <Text className="text-base font-bold text-foreground">Lịch sử rút tiền</Text>
              {historyLoading && (
                <ActivityIndicator size="small" color={BRAND} />
              )}
            </View>
          </>
        }
        ListEmptyComponent={historyLoading ? null : <HistoryEmpty />}
      />

      {/* Withdraw modal */}
      <WithdrawModal
        visible={modalVisible}
        availableBalance={wallet?.balance ?? 0}
        onClose={() => setModalVisible(false)}
        onSubmit={submitWithdraw}
      />
    </View>
  );
}
