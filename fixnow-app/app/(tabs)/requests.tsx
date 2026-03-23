import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text as RNText, View } from 'react-native';
import { RequestCard } from '~/features/home/components/request-card';
import { RequestsFilterTabs } from '~/features/requests/components/requests-filter-tabs';
import { useRequestsList } from '~/features/requests/hooks/use-requests-list';
import type { ServiceRequestDetail } from '~/features/requests/types';

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilter }: { hasFilter: boolean }) => {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 60 }}>
      <View style={{
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#f4f4f5',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <Feather name="clipboard" size={30} color="#a1a1aa" />
      </View>
      <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b', marginBottom: 6, textAlign: 'center' }}>
        {hasFilter ? 'Không có yêu cầu nào' : 'Chưa có yêu cầu'}
      </RNText>
      <RNText style={{ fontSize: 13, color: '#71717a', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
        {hasFilter
          ? 'Thử chọn bộ lọc khác để xem kết quả'
          : 'Tạo yêu cầu đầu tiên để được hỗ trợ sửa chữa tận nơi'}
      </RNText>
      {!hasFilter && (
        <Pressable
          onPress={() => router.push('/requests' as never)}
          style={{ backgroundColor: '#18181b', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <RNText style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Tạo yêu cầu ngay</RNText>
        </Pressable>
      )}
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
const RequestsScreen = () => {
  const router = useRouter();
  const { filter, setFilter, filtered, refreshing, onRefresh, counts } = useRequestsList();

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header — same pt-safe pattern as HomeHeader */}
      <View className="flex-row items-center justify-between pt-safe px-5 pb-3 border-b border-border">
        <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b' }}>Yêu cầu của tôi</RNText>
        <Pressable
          onPress={() => router.push('/requests' as never)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: '#18181b',
            alignItems: 'center', justifyContent: 'center',
          }}
          accessibilityLabel="Tạo yêu cầu mới"
        >
          <Feather name="plus" size={18} color="#ffffff" />
        </Pressable>
      </View>

      {/* Filter chips — fixed height, no layout shift */}
      <RequestsFilterTabs active={filter} counts={counts} onChange={setFilter} />

      {/* List */}
      <FlatList
        data={filtered as ServiceRequestDetail[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RequestCard request={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState hasFilter={filter !== 'all'} />}
      />
    </View>
  );
};

export default RequestsScreen;
