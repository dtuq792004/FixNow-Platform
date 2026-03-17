import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';

/** CTA banner prompting the customer to register as a provider */
export const BecomeProviderBanner = () => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/become-provider' as never)}
      style={{
        marginHorizontal: 16, marginBottom: 20,
        backgroundColor: '#18181b', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center',
      }}
      accessibilityRole="button"
      accessibilityLabel="Đăng ký làm thợ kỹ thuật"
    >
      {/* Icon */}
      <View style={{
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
      }}>
        <Feather name="briefcase" size={20} color="#ffffff" />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 2 }}>
          Trở thành thợ kỹ thuật
        </RNText>
        <RNText style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 17 }}>
          Nhận việc, kiếm thêm thu nhập cùng FixNow
        </RNText>
      </View>

      <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.5)" />
    </Pressable>
  );
};
