import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentResultView } from '~/features/payment/components/payment-result-view';

export default function PaymentCancelScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();

  return (
    <PaymentResultView
      icon="x"
      iconColor="#ef4444"
      iconBg="#fef2f2"
      iconBorderColor="#fecaca"
      title="Thanh toán bị hủy"
      subtitle="Yêu cầu của bạn đã được lưu nhưng chưa thanh toán. Bạn có thể thanh toán lại từ danh sách yêu cầu."
      actions={[
        {
          label: 'Xem yêu cầu của tôi',
          icon: 'list',
          variant: 'brand',
          className: 'w-full rounded-xl native:h-14 mb-3',
          onPress: () =>
            requestId
              ? router.replace(`/requests/${requestId}` as never)
              : router.replace('/(tabs)/requests' as never),
        },
        {
          label: 'Về trang chủ',
          variant: 'outline',
          className: 'w-full rounded-xl native:h-12',
          onPress: () => router.replace('/(tabs)' as never),
        },
      ]}
    />
  );
}
