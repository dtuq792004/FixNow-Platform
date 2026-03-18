import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRelativeTime } from '~/features/home/utils/format-time';
import { DetailHeroCard } from '~/features/requests/components/detail-hero-card';
import {
  DetailInfoRow,
  DetailNotFound,
  DetailSection,
} from '~/features/requests/components/detail-primitives';
import { DetailProviderCard } from '~/features/requests/components/detail-provider-card';
import { StatusTimeline } from '~/features/requests/components/status-timeline';
import { useRequestDetail } from '~/features/requests/hooks/use-request-detail';

const RequestDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { request, timeline } = useRequestDetail(id ?? '');

  if (!request) return <DetailNotFound onBack={() => router.back()} />;

  const canCancel = request.status === 'pending';

  const handleCancel = () => {
    Alert.alert('Huỷ yêu cầu', 'Bạn có chắc muốn huỷ yêu cầu này không?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Huỷ yêu cầu',
        style: 'destructive',
        onPress: () => router.back(), // TODO: call cancel API
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={{
        paddingTop: insets.top + 8, paddingBottom: 12,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b' }} numberOfLines={1}>
            {request.title}
          </RNText>
          <RNText style={{ fontSize: 12, color: '#a1a1aa' }}>{request.id}</RNText>
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
          <DetailInfoRow icon="clock" label="Thời gian tạo" value={getRelativeTime(request.created_at)} />
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
            style={{
              marginTop: 8, height: 48, borderRadius: 12,
              borderWidth: 1, borderColor: '#fecaca',
              backgroundColor: '#fff5f5', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'row',
            }}
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
