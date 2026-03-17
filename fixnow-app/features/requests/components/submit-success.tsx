import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text as RNText, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

interface SubmitSuccessProps {
  requestId: string;
}

export const SubmitSuccess = ({ requestId }: SubmitSuccessProps) => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      {/* Success icon */}
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: '#f0fdf4',
          borderWidth: 3,
          borderColor: '#bbf7d0',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Feather name="check" size={40} color="#16a34a" />
      </View>

      {/* Title */}
      <RNText
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: '#18181b',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Yêu cầu đã được gửi!
      </RNText>

      {/* Subtitle */}
      <RNText
        style={{
          fontSize: 14,
          color: '#71717a',
          textAlign: 'center',
          lineHeight: 22,
          marginBottom: 8,
        }}
      >
        Chúng tôi đang tìm thợ phù hợp và sẽ thông báo cho bạn sớm nhất.
      </RNText>

      {/* Request ID */}
      <View
        style={{
          backgroundColor: '#f4f4f5',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginBottom: 36,
        }}
      >
        <RNText style={{ fontSize: 12, color: '#71717a' }}>
          Mã yêu cầu:{' '}
          <RNText style={{ fontWeight: '700', color: '#18181b' }}>{requestId}</RNText>
        </RNText>
      </View>

      {/* Actions */}
      <Button
        variant="default"
        className="w-full rounded-xl native:h-12 mb-3"
        onPress={() => router.replace('/(tabs)' as never)}
      >
        <Feather name="home" size={16} color="#ffffff" />
        <Text className="ml-2 font-semibold">Về trang chủ</Text>
      </Button>

      <Button
        variant="outline"
        className="w-full rounded-xl native:h-12"
        onPress={() => router.replace('/(tabs)/requests' as never)}
      >
        <Text className="font-medium">Xem yêu cầu của tôi</Text>
      </Button>
    </View>
  );
};
