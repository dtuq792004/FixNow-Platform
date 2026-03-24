import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentResultView } from '~/features/payment/components/payment-result-view';

export default function CashSuccessScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();

  return (
    <PaymentResultView
      icon="check"
      iconColor="#ca8a04"
      iconBg="#fefce8"
      iconBorderColor="#fde68a"
      title="Yêu cầu đã được gửi!"
      subtitle="Chúng tôi đang tìm thợ phù hợp. Bạn sẽ thanh toán trực tiếp cho thợ sau khi dịch vụ hoàn tất."
      requestId={requestId}
      customChips={
        <View style={styles.chip}>
          <Feather name="dollar-sign" size={14} color="#ca8a04" style={{ marginRight: 4 }} />
          <Text style={styles.chipText}>Thanh toán khi hoàn thành</Text>
        </View>
      }
      actions={[
        {
          label: 'Về trang chủ',
          icon: 'home',
          variant: 'brand',
          className: 'w-full rounded-xl native:h-14 mb-3',
          onPress: () => router.replace('/(tabs)' as never),
        },
        {
          label: 'Xem yêu cầu của tôi',
          variant: 'outline',
          className: 'w-full rounded-xl native:h-12',
          onPress: () => router.replace('/(tabs)/requests' as never),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
});
