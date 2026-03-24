import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';
import type { ServiceRequestDetail } from '~/features/requests/types';

interface DetailProviderCardProps {
  provider: NonNullable<ServiceRequestDetail['provider']>;
}

/** Card showing assigned provider info + phone call shortcut + tap-to-profile navigation */
export const DetailProviderCard = ({ provider }: DetailProviderCardProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/providers/${provider.id}` as never)}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7',
        borderRadius: 14, padding: 14,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Xem hồ sơ ${provider.name}`}
    >
      {/* Avatar initial */}
      <View style={{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
          {provider.name.charAt(0)}
        </RNText>
      </View>

      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b' }}>{provider.name}</RNText>
        {provider.rating && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Feather name="star" size={11} color="#F59E0B" />
            <RNText style={{ fontSize: 12, color: '#71717a', marginLeft: 3 }}>
              {provider.rating.toFixed(1)}
            </RNText>
          </View>
        )}
        <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
          Nhấn để xem hồ sơ
        </RNText>
      </View>

      {/* Call button — stops propagation so it doesn't trigger profile navigation */}
      {provider.phone && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            // Linking.openURL(`tel:${provider.phone}`);
          }}
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0',
            alignItems: 'center', justifyContent: 'center', marginLeft: 8,
          }}
          accessibilityLabel={`Gọi cho ${provider.name}`}
        >
          <Feather name="phone" size={15} color="#16a34a" />
        </Pressable>
      )}

      <Feather name="chevron-right" size={16} color="#d4d4d8" style={{ marginLeft: 4 }} />
    </Pressable>
  );
};
