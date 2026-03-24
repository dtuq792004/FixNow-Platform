import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentResultView } from '~/features/payment/components/payment-result-view';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();

  return (
    <PaymentResultView
      icon="check"
      iconColor="#16a34a"
      iconBg="#f0fdf4"
      iconBorderColor="#bbf7d0"
      title="Thanh toán thành công!"
      subtitle="Yêu cầu của bạn đã được thanh toán. Chúng tôi đang tìm thợ phù hợp và sẽ thông báo cho bạn sớm nhất."
      requestId={requestId}
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
