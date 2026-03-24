import { Feather } from '@expo/vector-icons';
import { FlatList, Pressable, Text as RNText, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProviderCard } from '~/features/search/components/provider-card';
import { SearchBrowse } from '~/features/search/components/search-browse';
import { SearchInput } from '~/features/search/components/search-input';
import { ServiceResultCard } from '~/features/search/components/service-result-card';
import { useSearch } from '~/features/search/hooks/use-search';
import type { SearchResult, SearchSegment } from '~/features/search/types';

// ── Segment switcher ──────────────────────────────────────────────────────────
interface SegmentBarProps {
  active: SearchSegment;
  serviceCnt: number;
  providerCnt: number;
  onChange: (s: SearchSegment) => void;
}

const SegmentBar = ({ active, serviceCnt, providerCnt, onChange }: SegmentBarProps) => (
  <View style={{
    flexDirection: 'row', height: 44,
    borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
    paddingHorizontal: 16,
  }}>
    {(
      [
        { key: 'service' as SearchSegment, label: 'Dịch vụ', count: serviceCnt },
        { key: 'provider' as SearchSegment, label: 'Thợ kỹ thuật', count: providerCnt },
      ]
    ).map((seg) => {
      const isActive = seg.key === active;
      return (
        <Pressable
          key={seg.key}
          onPress={() => onChange(seg.key)}
          style={{
            marginRight: 20, justifyContent: 'center', alignItems: 'center',
            flexDirection: 'row', borderBottomWidth: 2,
            borderBottomColor: isActive ? '#18181b' : 'transparent',
            paddingBottom: 2,
          }}
        >
          <RNText style={{ fontSize: 14, fontWeight: isActive ? '700' : '400', color: isActive ? '#18181b' : '#a1a1aa' }}>
            {seg.label}
          </RNText>
          {seg.count > 0 && (
            <View style={{
              marginLeft: 6, minWidth: 18, height: 18, borderRadius: 9,
              backgroundColor: isActive ? '#18181b' : '#e4e4e7',
              alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
            }}>
              <RNText style={{ fontSize: 10, fontWeight: '700', color: isActive ? '#fff' : '#71717a' }}>
                {seg.count}
              </RNText>
            </View>
          )}
        </Pressable>
      );
    })}
  </View>
);

// ── No results ────────────────────────────────────────────────────────────────
const NoResults = ({ query }: { query: string }) => (
  <View style={{ flex: 1, alignItems: 'center', paddingTop: 60, padding: 32 }}>
    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
      <Feather name="search" size={26} color="#a1a1aa" />
    </View>
    <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 6, textAlign: 'center' }}>
      Không tìm thấy kết quả
    </RNText>
    <RNText style={{ fontSize: 13, color: '#71717a', textAlign: 'center', lineHeight: 20 }}>
      {'Không có kết quả phù hợp với\n'}
      <RNText style={{ fontWeight: '600', color: '#18181b' }}>&quot;{query}&quot;</RNText>
    </RNText>
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
const SearchScreen = () => {
  const router = useRouter();
  const {
    query, setQuery, clearQuery,
    segment, setSegment,
    serviceResults, providerResults,
    hasResults, isSearching,
  } = useSearch();

  const currentResults = segment === 'service' ? serviceResults : providerResults;

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header + search input */}
      <View className="pt-safe px-4 pb-3 border-b border-border">
        <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b', marginBottom: 12 }}>
          Tìm kiếm
        </RNText>
        <SearchInput value={query} onChangeText={setQuery} onClear={clearQuery} />
      </View>

      {/* Segment bar — only when searching */}
      {isSearching && (
        <SegmentBar
          active={segment}
          serviceCnt={serviceResults.length}
          providerCnt={providerResults.length}
          onChange={setSegment}
        />
      )}

      {/* Content */}
      {!isSearching ? (
        <SearchBrowse />
      ) : !hasResults ? (
        <NoResults query={query} />
      ) : (
        <FlatList<SearchResult>
          key={segment}
          data={currentResults as SearchResult[]}
          keyExtractor={(_, i) => `${segment}-${i}`}
          renderItem={({ item }) =>
            item.type === 'service' ? (
              <ServiceResultCard item={item} />
            ) : (
              <ProviderCard
                provider={item.provider}
                onPress={() => router.push(`/providers/${item.provider.id}` as never)}
              />
            )
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<NoResults query={query} />}
        />
      )}
    </View>
  );
};

export default SearchScreen;
