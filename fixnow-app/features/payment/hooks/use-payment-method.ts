import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { paymentService } from '~/features/payment/services/payment.service';

export type PaymentMethod = 'PAYOS' | 'CASH';

export const usePaymentMethod = (requestId: string, checkoutUrl: string) => {
  const router = useRouter();
  const [selected, setSelected] = useState<PaymentMethod>('PAYOS');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (selected === 'PAYOS') {
      // Navigate to in-app WebView
      router.replace({
        pathname: '/payment/webview',
        params: { checkoutUrl, requestId },
      } as never);
    } else {
      // Call pay-later API → request becomes PENDING (appears on provider job market)
      try {
        setLoading(true);
        await paymentService.payLater(requestId);
        router.replace({
          pathname: '/payment/cash-success',
          params: { requestId },
        } as never);
      } catch (err: any) {
        Alert.alert('Lỗi', err?.message ?? 'Không thể xử lý yêu cầu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    selected,
    setSelected,
    loading,
    handleConfirm,
  };
};
