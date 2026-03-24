import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MethodCard } from '~/features/payment/components/method-card';
import { usePaymentMethod } from '~/features/payment/hooks/use-payment-method';

export default function SelectPaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestId, checkoutUrl, finalPrice } = useLocalSearchParams<{
    requestId: string;
    checkoutUrl: string;
    finalPrice: string;
  }>();

  const { selected, setSelected, loading, handleConfirm } = usePaymentMethod(
    requestId ?? '',
    checkoutUrl ?? ''
  );

  const formattedPrice = finalPrice
    ? Number(finalPrice).toLocaleString('vi-VN') + ' ₫'
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <Text style={styles.headerTitle}>Chọn phương thức thanh toán</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Amount banner ───────────────────────────────────────────── */}
        {formattedPrice && (
          <View style={styles.amountBanner}>
            <Text style={styles.amountLabel}>Tổng cần thanh toán</Text>
            <Text style={styles.amountValue}>{formattedPrice}</Text>
          </View>
        )}

        {/* ── Section title ───────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Chọn cách thanh toán</Text>

        {/* ── Method cards ────────────────────────────────────────────── */}
        <MethodCard
          selected={selected === 'PAYOS'}
          onPress={() => setSelected('PAYOS')}
          icon="credit-card"
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          title="Thanh toán qua PayOS"
          subtitle="Thanh toán ngay bằng chuyển khoản, thẻ nội địa hoặc ví điện tử"
          badge="Khuyến nghị"
          badgeColor="#3b82f6"
        />

        <MethodCard
          selected={selected === 'CASH'}
          onPress={() => setSelected('CASH')}
          icon="dollar-sign"
          iconBg="#fefce8"
          iconColor="#ca8a04"
          title="Thanh toán khi hoàn thành"
          subtitle="Trả tiền mặt trực tiếp cho thợ sau khi dịch vụ hoàn tất"
        />

        {/* ── Info note ───────────────────────────────────────────────── */}
        <View style={styles.infoBox}>
          <Feather name="info" size={15} color="#3b82f6" style={{ marginRight: 8, marginTop: 1 }} />
          {selected === 'PAYOS' ? (
            <Text style={styles.infoText}>
              Bạn sẽ được chuyển đến trang thanh toán PayOS an toàn. Yêu cầu sẽ được xử lý ngay sau khi thanh toán thành công.
            </Text>
          ) : (
            <Text style={styles.infoText}>
              Yêu cầu của bạn sẽ được đăng lên hệ thống ngay. Thợ sẽ liên hệ và bạn thanh toán trực tiếp khi hoàn thành.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* ── Confirm button ──────────────────────────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={handleConfirm}
          disabled={loading}
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Feather
                name={selected === 'PAYOS' ? 'credit-card' : 'check-circle'}
                size={18}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.confirmBtnText}>
                {selected === 'PAYOS' ? 'Tiến hành thanh toán' : 'Xác nhận thanh toán sau'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerBack: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  amountBanner: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 13,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1d4ed8',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    backgroundColor: '#ffffff',
  },
  confirmBtn: {
    height: 52,
    backgroundColor: '#18181b',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#a1a1aa',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});

