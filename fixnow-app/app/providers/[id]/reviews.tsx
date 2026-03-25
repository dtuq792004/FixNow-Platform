import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRelativeTime } from '~/features/home/utils/format-time';
import { useProviderFeedbacks } from '~/features/feedback/hooks/use-feedback';
import type { ReviewData } from '~/features/feedback/services/feedback.service';

// ── Star row ──────────────────────────────────────────────────────────────────
const StarRow = ({ rating }: { rating: number }) => {
  const full = Math.round(rating);
  return (
    <View className="flex-row gap-0.5 mt-1 mb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Feather key={i} name="star" size={13} color={i < full ? '#F59E0B' : '#E4E4E7'} />
      ))}
      <Text className="text-[12px] text-zinc-400 ml-1">{rating.toFixed(1)}</Text>
    </View>
  );
};

// ── Review card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ item }: { item: ReviewData }) => (
  <View className="px-4 py-4 border-b border-zinc-100">
    <View className="flex-row items-center justify-between mb-0.5">
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 rounded-full bg-zinc-200 items-center justify-center">
          <Text className="text-[12px] font-bold text-zinc-600">
            {item.customerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-[13px] font-semibold text-zinc-900">{item.customerName}</Text>
      </View>
      <Text className="text-[11px] text-zinc-400">{getRelativeTime(item.createdAt)}</Text>
    </View>
    <StarRow rating={item.rating} />
    {!!item.comment && (
      <Text className="text-[13px] text-zinc-600 leading-5">"{item.comment}"</Text>
    )}
  </View>
);

// ── Footer — load more / end ──────────────────────────────────────────────────
const ListFooter = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) => {
  if (!hasNextPage) {
    return (
      <View className="py-8 items-center">
        <Text className="text-[12px] text-zinc-400">Đã hiển thị tất cả đánh giá</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onLoadMore}
      disabled={isFetchingNextPage}
      className="mx-4 my-4 h-11 rounded-xl border border-zinc-200 items-center justify-center active:bg-zinc-50"
    >
      {isFetchingNextPage ? (
        <ActivityIndicator size="small" color="#a1a1aa" />
      ) : (
        <Text className="text-[13px] font-semibold text-zinc-700">Tải thêm</Text>
      )}
    </Pressable>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AllReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Provider._id
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProviderFeedbacks(id ?? '');

  const allReviews: ReviewData[] = data?.pages.flatMap((p) => p.reviews) ?? [];
  const totalDocs = data?.pages[0]?.totalDocs ?? 0;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center border-b border-zinc-100 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={() => router.back()} className="p-2 mr-1">
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-bold text-zinc-900">Tất cả đánh giá</Text>
          {totalDocs > 0 && (
            <Text className="text-[11px] text-zinc-400 mt-px">{totalDocs} đánh giá</Text>
          )}
        </View>
      </View>

      {/* Loading */}
      {isLoading && (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#18181b" />
          <Text className="text-[13px] text-zinc-400">Đang tải đánh giá...</Text>
        </View>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="alert-circle" size={28} color="#ef4444" />
          <Text className="text-[15px] font-bold text-zinc-900 mt-3 mb-1">Không tải được</Text>
          <Text className="text-[13px] text-zinc-500 text-center">
            Vui lòng quay lại và thử lại.
          </Text>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && (
        <FlatList
          data={allReviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReviewCard item={item} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-2">
              <Feather name="message-square" size={30} color="#d4d4d8" />
              <Text className="text-[14px] text-zinc-400">Chưa có đánh giá nào</Text>
            </View>
          }
          ListFooterComponent={
            <ListFooter
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          }
        />
      )}
    </View>
  );
}
