/**
 * Review list section for the public provider profile screen.
 * Renders up to 5 most-recent visible reviews, with an optional "See all" link.
 */
import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import { getRelativeTime } from '~/features/home/utils/format-time';
import type { PublicProviderProfile } from '../services/provider-public-profile.service';

type ReviewItem = PublicProviderProfile['recentReviews'][number];

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.round(rating);
  return (
    <View className="flex-row gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Feather
          key={i}
          name="star"
          size={12}
          color={i < full ? '#F59E0B' : '#E4E4E7'}
        />
      ))}
    </View>
  );
};

const ReviewCard = ({ review }: { review: ReviewItem }) => (
  <View className="py-3 border-b border-zinc-100 last:border-0">
    <View className="flex-row items-center justify-between mb-1">
      <View className="flex-row items-center gap-2">
        <View className="w-7 h-7 rounded-full bg-zinc-200 items-center justify-center">
          <RNText style={{ fontSize: 11, fontWeight: '700', color: '#52525b' }}>
            {review.customerName.charAt(0)}
          </RNText>
        </View>
        <RNText style={{ fontSize: 13, fontWeight: '600', color: '#18181b' }}>
          {review.customerName}
        </RNText>
      </View>
      <RNText style={{ fontSize: 11, color: '#a1a1aa' }}>
        {getRelativeTime(review.createdAt)}
      </RNText>
    </View>

    <StarRating rating={review.rating} />

    {!!review.comment && (
      <RNText
        style={{ fontSize: 13, color: '#3f3f46', lineHeight: 20, marginTop: 5 }}
        numberOfLines={3}
      >
        "{review.comment}"
      </RNText>
    )}
  </View>
);

interface Props {
  reviews: ReviewItem[];
  reviewCount: number;
  /** Called when user taps "Xem tất cả" — only shown if there are more reviews than displayed */
  onSeeAll?: () => void;
}

export const PublicProfileReviews = ({ reviews, reviewCount, onSeeAll }: Props) => {
  const hasMore = onSeeAll && reviewCount > reviews.length;

  return (
    <View className="border border-zinc-200 rounded-2xl overflow-hidden mb-4">
      {/* Section header */}
      <View className="bg-zinc-50 px-4 py-2.5 flex-row items-center justify-between">
        <RNText style={{ fontSize: 12, fontWeight: '700', color: '#71717a', letterSpacing: 0.4 }}>
          ĐÁNH GIÁ
        </RNText>
        {reviewCount > 0 && (
          <View className="bg-amber-100 rounded-full px-2 py-0.5">
            <RNText style={{ fontSize: 11, fontWeight: '700', color: '#D97706' }}>
              {reviewCount}
            </RNText>
          </View>
        )}
      </View>

      <View className="px-4">
        {reviews.length === 0 ? (
          <View className="py-6 items-center gap-2">
            <Feather name="message-square" size={24} color="#d4d4d8" />
            <RNText style={{ fontSize: 13, color: '#a1a1aa' }}>Chưa có đánh giá nào</RNText>
          </View>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </View>

      {/* "See all" footer — only when more reviews exist */}
      {hasMore && (
        <Pressable
          onPress={onSeeAll}
          className="border-t border-zinc-100 px-4 py-3 flex-row items-center justify-center gap-1.5 active:bg-zinc-50"
        >
          <RNText style={{ fontSize: 13, fontWeight: '600', color: '#18181b' }}>
            Xem tất cả {reviewCount} đánh giá
          </RNText>
          <Feather name="arrow-right" size={14} color="#18181b" />
        </Pressable>
      )}
    </View>
  );
};
