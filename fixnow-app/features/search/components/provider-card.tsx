import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import { SERVICE_CATEGORIES } from '~/features/home/data/service-categories';
import type { Provider } from '~/features/search/types';

interface ProviderCardProps {
  provider: Provider;
  onPress?: () => void;
}

const SPECIALTY_MAX = 3;

export const ProviderCard = ({ provider, onPress }: ProviderCardProps) => {
  const specialtyLabels = provider.specialties
    .slice(0, SPECIALTY_MAX)
    .map((s) => SERVICE_CATEGORIES.find((c) => c.type === s)?.label ?? s);

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4e4e7',
        borderRadius: 14, padding: 14, marginBottom: 10,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Thợ ${provider.name}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <View style={{
          width: 46, height: 46, borderRadius: 23,
          backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center',
          marginRight: 12, flexShrink: 0,
        }}>
          <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {provider.name.charAt(0)}
          </RNText>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          {/* Name + verified */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginRight: 5 }}>
              {provider.name}
            </RNText>
            {provider.isVerified && (
              <View style={{
                width: 16, height: 16, borderRadius: 8,
                backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
              }}>
                <Feather name="check" size={9} color="#fff" />
              </View>
            )}
          </View>

          {/* Rating + jobs */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Feather name="star" size={12} color="#F59E0B" />
            <RNText style={{ fontSize: 12, color: '#18181b', fontWeight: '600', marginLeft: 3, marginRight: 8 }}>
              {provider.rating.toFixed(1)}
            </RNText>
            <RNText style={{ fontSize: 12, color: '#71717a' }}>
              {provider.completedJobs} việc hoàn thành
            </RNText>
          </View>

          {/* Specialty chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
            {specialtyLabels.map((label) => (
              <View key={label} style={{
                paddingHorizontal: 8, paddingVertical: 3,
                backgroundColor: '#f4f4f5', borderRadius: 6,
              }}>
                <RNText style={{ fontSize: 11, color: '#52525b', fontWeight: '500' }}>{label}</RNText>
              </View>
            ))}
          </View>

          {/* Location + price */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="map-pin" size={11} color="#a1a1aa" />
              <RNText style={{ fontSize: 11, color: '#a1a1aa', marginLeft: 3 }}>{provider.location}</RNText>
            </View>
            {provider.priceNote && (
              <RNText style={{ fontSize: 11, color: '#16a34a', fontWeight: '600' }}>
                {provider.priceNote}
              </RNText>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};
