/**
 * Displays the customer's feedback for a completed job — shown in the
 * provider's job detail screen under the "Kết quả" section.
 */
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';
import { getRelativeTime } from '~/features/home/utils/format-time';
import { useRequestFeedback } from '../hooks/use-feedback';

// ── Star row ──────────────────────────────────────────────────────────────────
const StarRow = ({ rating }: { rating: number }) => {
  const full = Math.round(rating);
  return (
    <View className="flex-row gap-0.5 mt-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Feather key={i} name="star" size={13} color={i < full ? '#F59E0B' : '#E4E4E7'} />
      ))}
      <Text className="text-[12px] text-zinc-400 ml-1">{rating.toFixed(1)}</Text>
    </View>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
interface JobFeedbackCardProps {
  requestId: string;
}

export const JobFeedbackCard = ({ requestId }: JobFeedbackCardProps) => {
  const { data: feedback, isLoading } = useRequestFeedback(requestId, true);

  return (
    <View className="border border-zinc-200 rounded-2xl overflow-hidden mb-6">
      {/* Header */}
      <View className="bg-zinc-50 px-4 py-2.5 flex-row items-center justify-between">
        <Text className="text-[12px] font-bold text-zinc-500 tracking-wide">
          ĐÁNH GIÁ TỪ KHÁCH
        </Text>
        {feedback && (
          <View className="bg-amber-100 rounded-full px-2 py-0.5">
            <Text className="text-[11px] font-bold text-amber-600">{feedback.rating} ⭐</Text>
          </View>
        )}
      </View>

      <View className="px-4 py-3">
        {/* Loading */}
        {isLoading && (
          <View className="flex-row items-center gap-2 py-2">
            <ActivityIndicator size="small" color="#a1a1aa" />
            <Text className="text-[13px] text-zinc-400">Đang tải đánh giá...</Text>
          </View>
        )}

        {/* No feedback yet */}
        {!isLoading && !feedback && (
          <View className="py-4 items-center gap-2">
            <Feather name="message-square" size={22} color="#d4d4d8" />
            <Text className="text-[13px] text-zinc-400">Khách hàng chưa đánh giá</Text>
          </View>
        )}

        {/* Feedback exists */}
        {!isLoading && feedback && (
          <View>
            {/* Customer row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full bg-zinc-200 items-center justify-center">
                  <Text className="text-[11px] font-bold text-zinc-600">
                    {feedback.customerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-[13px] font-semibold text-zinc-900">
                  {feedback.customerName}
                </Text>
              </View>
              <Text className="text-[11px] text-zinc-400">
                {getRelativeTime(feedback.createdAt)}
              </Text>
            </View>

            <StarRow rating={feedback.rating} />

            {!!feedback.comment && (
              <Text className="text-[13px] text-zinc-600 leading-5 mt-2">
                "{feedback.comment}"
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
