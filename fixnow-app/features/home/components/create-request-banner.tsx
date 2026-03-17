import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

// Hardcoded dark so the hero card always stays dark regardless of light/dark theme
const CARD_BG = '#18181b';     // zinc-900
const DECO_BG = 'rgba(255,255,255,0.06)';

export const CreateRequestBanner = () => {
  const router = useRouter();

  return (
    <Pressable
      style={{ backgroundColor: CARD_BG, borderRadius: 20, padding: 20, marginBottom: 24, overflow: 'hidden' }}
      onPress={() => router.push('/requests/create' as never)}
      accessibilityRole="button"
      accessibilityLabel="Tạo yêu cầu sửa chữa mới"
    >
      {/* Decorative circles */}
      <View style={{
        position: 'absolute', right: -24, top: -24,
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: DECO_BG,
      }} />
      <View style={{
        position: 'absolute', right: 40, top: 36,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: DECO_BG,
      }} />

      {/* Title row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <RNText style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', lineHeight: 30, flex: 1, marginRight: 12 }}>
          {'Cần hỗ trợ\nsửa chữa?'}
        </RNText>

        {/* Icon badge */}
        <View style={{
          width: 48, height: 48, borderRadius: 14,
          backgroundColor: '#F97316',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Feather name="tool" size={22} color="#ffffff" />
        </View>
      </View>

      {/* Subtitle */}
      <RNText style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 18 }}>
        Thợ lành nghề · Giá cả minh bạch · Bảo hành uy tín
      </RNText>

      {/* CTA */}
      <Button
        variant="brand"
        className="rounded-xl native:h-12"
        onPress={() => router.push('/requests/create' as never)}
      >
        <Feather name="plus-circle" size={16} color="#ffffff" />
        <Text className="ml-2 font-semibold">Tạo yêu cầu ngay</Text>
      </Button>
    </Pressable>
  );
};
