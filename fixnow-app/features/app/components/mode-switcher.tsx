import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { useActiveMode, useSetMode } from '~/features/app/stores/app-mode.store';

const BRAND = '#F97316';
const ACTIVE_BG = '#18181b';

export function ModeSwitcher() {
  const activeMode = useActiveMode();
  const setMode = useSetMode();
  const router = useRouter();

  const switchTo = (mode: 'customer' | 'provider') => {
    if (activeMode === mode) return;
    setMode(mode);
    if (mode === 'provider') {
      router.replace('/(provider-tabs)' as never);
    } else {
      router.replace('/(tabs)' as never);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        padding: 3,
        alignSelf: 'flex-start',
      }}
    >
      {/* Customer tab */}
      <Pressable
        onPress={() => switchTo('customer')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 16,
          backgroundColor: activeMode === 'customer' ? '#fff' : 'transparent',
          shadowColor: activeMode === 'customer' ? '#000' : 'transparent',
          shadowOpacity: activeMode === 'customer' ? 0.08 : 0,
          shadowRadius: 4,
          elevation: activeMode === 'customer' ? 2 : 0,
        }}
        accessibilityLabel="Chế độ khách hàng"
      >
        <Feather
          name="home"
          size={13}
          color={activeMode === 'customer' ? ACTIVE_BG : '#9ca3af'}
          style={{ marginRight: 5 }}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: activeMode === 'customer' ? '700' : '500',
            color: activeMode === 'customer' ? ACTIVE_BG : '#9ca3af',
          }}
        >
          Khách
        </Text>
      </Pressable>

      {/* Provider tab */}
      <Pressable
        onPress={() => switchTo('provider')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 16,
          backgroundColor: activeMode === 'provider' ? BRAND : 'transparent',
          shadowColor: activeMode === 'provider' ? BRAND : 'transparent',
          shadowOpacity: activeMode === 'provider' ? 0.3 : 0,
          shadowRadius: 6,
          elevation: activeMode === 'provider' ? 3 : 0,
        }}
        accessibilityLabel="Chế độ thợ"
      >
        <Feather
          name="tool"
          size={13}
          color={activeMode === 'provider' ? '#fff' : '#9ca3af'}
          style={{ marginRight: 5 }}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: activeMode === 'provider' ? '700' : '500',
            color: activeMode === 'provider' ? '#fff' : '#9ca3af',
          }}
        >
          Thợ
        </Text>
      </Pressable>
    </View>
  );
}
