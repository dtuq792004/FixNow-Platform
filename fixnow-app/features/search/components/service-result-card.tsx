import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';
import type { ServiceSearchResult } from '~/features/search/types';

interface ServiceResultCardProps {
  item: ServiceSearchResult;
}

export const ServiceResultCard = ({ item }: ServiceResultCardProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/requests?category=${item.category}` as never)}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4e4e7',
        borderRadius: 14, padding: 14, marginBottom: 10,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Dịch vụ ${item.label}`}
    >
      {/* Icon */}
      <View
        className={item.bgClass}
        style={{ width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}
      >
        <Feather name={item.icon as never} size={20} color={item.iconColor} />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 2 }}>
          {item.label}
        </RNText>
        <RNText style={{ fontSize: 12, color: '#71717a', lineHeight: 17 }} numberOfLines={1}>
          {item.description}
        </RNText>
      </View>

      {/* CTA arrow */}
      <View style={{
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center', marginLeft: 8,
      }}>
        <Feather name="arrow-right" size={15} color="#52525b" />
      </View>
    </Pressable>
  );
};
