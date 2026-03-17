import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text as RNText, View, Pressable } from 'react-native';
import { SERVICE_CATEGORIES } from '~/features/home/data/service-categories';
import { MOCK_PROVIDERS } from '~/features/search/data/mock-providers';
import { ProviderCard } from './provider-card';

/** Shown when search query is empty — browse categories + top providers */
export const SearchBrowse = () => {
  const router = useRouter();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Category grid */}
      <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 12 }}>
          Danh mục dịch vụ
        </RNText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {SERVICE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.type}
              onPress={() => router.push(`/requests?category=${cat.type}` as never)}
              style={{
                width: '30.5%', alignItems: 'center', paddingVertical: 14,
                backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7',
                borderRadius: 14,
              }}
              accessibilityRole="button"
              accessibilityLabel={cat.label}
            >
              <View
                className={cat.bgClass}
                style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 7 }}
              >
                <Feather name={cat.icon as never} size={20} color={cat.iconColor} />
              </View>
              <RNText style={{ fontSize: 12, fontWeight: '600', color: '#18181b', textAlign: 'center' }}>
                {cat.label}
              </RNText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Top providers */}
      <View style={{ paddingHorizontal: 16 }}>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 12 }}>
          Thợ nổi bật
        </RNText>
        {MOCK_PROVIDERS.slice(0, 4).map((p) => (
          <ProviderCard key={p.id} provider={p} />
        ))}
      </View>
    </ScrollView>
  );
};
