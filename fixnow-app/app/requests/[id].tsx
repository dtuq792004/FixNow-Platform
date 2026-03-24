import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedbackModal } from '~/features/feedback/components/feedback-modal';
import { useHasFeedback } from '~/features/feedback/hooks/use-feedback';
import { getRelativeTime } from '~/features/home/utils/format-time';
import { DetailHeroCard } from '~/features/requests/components/detail-hero-card';
import { DetailInfoRow, DetailSection } from '~/features/requests/components/detail-primitives';
import { DetailProviderCard } from '~/features/requests/components/detail-provider-card';
import {
  RequestDetailErrorState,
  RequestDetailLoadingSkeleton,
} from '~/features/requests/components/request-detail-states';
import { StatusTimeline } from '~/features/requests/components/status-timeline';
import { useRequestDetail } from '~/features/requests/hooks/use-request-detail';
import { cancelRequestApi } from '~/features/requests/services/request.service';

// ── Screen ────────────────────────────────────────────────────────────────────
const RequestDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { request, timeline, isLoading, error, refetch } = useRequestDetail(id ?? '');

  const isCompleted = request?.status === 'completed';
  const { data: hasFeedback } = useHasFeedback(request?.id ?? '', isCompleted);

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (isLoading) return <RequestDetailLoadingSkeleton onBack={() => router.back()} />;
  if (error || !request)
    return (
      <RequestDetailErrorState
        message={error ?? 'Yêu cầu không tồn tại hoặc bạn không có quyền truy cập.'}
        onBack={() => router.back()}
        onRetry={refetch}
      />
    );

  const handleCancel = () => {
    Alert.alert('Huỷ yêu cầu', 'Bạn có chắc muốn huỷ yêu cầu này không?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Huỷ yêu cầu',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelRequestApi(request.id);
            Alert.alert('Đã huỷ', 'Yêu cầu đã được huỷ thành công.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch {
            Alert.alert('Lỗi', 'Không thể huỷ yêu cầu. Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

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
          <Text className="text-base font-bold text-zinc-900" numberOfLines={1}>
            {request.title}
          </Text>
          <Text className="text-[11px] text-zinc-400 mt-px">
            #{request.id.slice(-8).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <DetailHeroCard category={request.category} status={request.status} />

        <DetailSection title="Chi tiết yêu cầu">
          <DetailInfoRow icon="file-text"    label="Tiêu đề"       value={request.title} />
          <DetailInfoRow icon="align-left"   label="Mô tả vấn đề"  value={request.description} />
          <DetailInfoRow icon="map-pin"      label="Địa chỉ"       value={request.address} />
          {request.note && (
            <DetailInfoRow icon="message-circle" label="Ghi chú"   value={request.note} />
          )}
          <DetailInfoRow
            icon="clock"
            label="Thời gian tạo"
            value={getRelativeTime(request.created_at)}
          />
        </DetailSection>

        {request.provider && (
          <DetailSection title="Thợ phụ trách">
            <DetailProviderCard provider={request.provider} />
          </DetailSection>
        )}

        <DetailSection title="Tiến trình">
          <StatusTimeline events={timeline} />
        </DetailSection>

        {/* ── Cancel (pending only) ─────────────────────────────────────── */}
        {request.status === 'pending' && (
          <Pressable
            onPress={handleCancel}
            className="mt-2 h-12 rounded-xl border border-red-200 bg-red-50 flex-row items-center justify-center gap-2 active:opacity-80"
          >
            <Feather name="x-circle" size={16} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-sm">Huỷ yêu cầu</Text>
          </Pressable>
        )}

        {/* ── Feedback (completed only) ─────────────────────────────────── */}
        {isCompleted && request.provider && (
          hasFeedback ? (
            <View className="mt-2 h-12 rounded-xl border border-zinc-200 bg-zinc-50 flex-row items-center justify-center gap-2">
              <Feather name="check-circle" size={16} color="#16a34a" />
              <Text className="text-zinc-500 font-semibold text-sm">Đã đánh giá</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => setFeedbackOpen(true)}
              className="mt-2 h-12 rounded-xl bg-zinc-900 flex-row items-center justify-center gap-2 active:opacity-80"
            >
              <Feather name="star" size={15} color="#F59E0B" />
              <Text className="text-white font-bold text-sm">Đánh giá dịch vụ</Text>
            </Pressable>
          )
        )}
      </ScrollView>

      {/* Feedback modal */}
      {isCompleted && request.provider && (
        <FeedbackModal
          visible={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          requestId={request.id}
          providerId={request.provider.id}
          providerName={request.provider.name}
        />
      )}
    </View>
  );
};

export default RequestDetailScreen;
