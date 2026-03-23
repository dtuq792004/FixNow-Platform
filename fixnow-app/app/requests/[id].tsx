import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ActivityIndicator, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRelativeTime } from '~/features/home/utils/format-time';
import { DetailHeroCard } from '~/features/requests/components/detail-hero-card';
import {
  DetailInfoRow,
  DetailSection,
} from '~/features/requests/components/detail-primitives';
import { DetailProviderCard } from '~/features/requests/components/detail-provider-card';
import { StatusTimeline } from '~/features/requests/components/status-timeline';
import { useRequestDetail } from '~/features/requests/hooks/use-request-detail';
import { cancelRequestApi } from '~/features/requests/services/request.service';

// ── Loading skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = ({ onBack }: { onBack: () => void }) => {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center border-b border-zinc-100 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={onBack} className="p-2 mr-1">
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View className="h-5 w-48 bg-zinc-100 rounded" />
      </View>
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#18181b" />
        <RNText style={{ fontSize: 13, color: '#a1a1aa' }}>Đang tải...</RNText>
      </View>
    </View>
  );
};

// ── Error state ───────────────────────────────────────────────────────────────
const ErrorState = ({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center border-b border-zinc-100 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={onBack} className="p-2 mr-1">
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b' }}>
          Chi tiết yêu cầu
        </RNText>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
          <Feather name="alert-circle" size={30} color="#ef4444" />
        </View>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', textAlign: 'center', marginBottom: 8 }}>
          Không tìm thấy yêu cầu
        </RNText>
        <RNText style={{ fontSize: 13, color: '#71717a', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
          {message}
        </RNText>
        <View className="flex-row gap-3 w-full">
          <Pressable
            onPress={onBack}
            className="flex-1 h-11 border border-zinc-200 rounded-xl items-center justify-center active:opacity-70"
          >
            <RNText style={{ fontSize: 14, fontWeight: '600', color: '#3f3f46' }}>Quay lại</RNText>
          </Pressable>
          <Pressable
            onPress={onRetry}
            className="flex-1 h-11 bg-zinc-900 rounded-xl items-center justify-center active:opacity-80"
          >
            <RNText style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Thử lại</RNText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
const RequestDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { request, timeline, isLoading, error, refetch } = useRequestDetail(id ?? '');

  if (isLoading) return <LoadingSkeleton onBack={() => router.back()} />;
  if (error || !request)
    return (
      <ErrorState
        message={error ?? 'Yêu cầu không tồn tại hoặc bạn không có quyền truy cập.'}
        onBack={() => router.back()}
        onRetry={refetch}
      />
    );

  const canCancel = request.status === 'pending';

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
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View
        className="flex-row items-center border-b border-zinc-100 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={() => router.back()} className="p-2 mr-1">
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View className="flex-1">
          <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b' }} numberOfLines={1}>
            {request.title}
          </RNText>
          <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>
            #{request.id.slice(-8).toUpperCase()}
          </RNText>
        </View>
      </View>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <DetailHeroCard category={request.category} status={request.status} />

        <DetailSection title="Chi tiết yêu cầu">
          <DetailInfoRow icon="file-text" label="Tiêu đề" value={request.title} />
          <DetailInfoRow icon="align-left" label="Mô tả vấn đề" value={request.description} />
          <DetailInfoRow icon="map-pin" label="Địa chỉ" value={request.address} />
          {request.note && (
            <DetailInfoRow icon="message-circle" label="Ghi chú" value={request.note} />
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

        {canCancel && (
          <Pressable
            onPress={handleCancel}
            className="mt-2 h-12 rounded-xl border border-red-200 bg-red-50 flex-row items-center justify-center gap-2 active:opacity-80"
          >
            <Feather name="x-circle" size={16} color="#ef4444" />
            <RNText style={{ color: '#ef4444', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
              Huỷ yêu cầu
            </RNText>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

export default RequestDetailScreen;
