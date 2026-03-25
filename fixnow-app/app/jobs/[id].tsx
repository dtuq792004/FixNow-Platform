import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { getCategoryConfig } from '~/features/home/data/service-categories';
import { getRelativeTime } from '~/features/home/utils/format-time';
import {
  DetailInfoRow,
  DetailNotFound,
  DetailSection,
} from '~/features/requests/components/detail-primitives';
import { StatusTimeline } from '~/features/requests/components/status-timeline';
import { JobDetailActions } from '~/features/provider/components/job-detail-actions';
import { JobStatusBadge } from '~/features/provider/components/job-status-badge';
import { useProviderJobDetail } from '~/features/provider/hooks/use-provider-job-detail';
import { useJobDetailHandlers } from '~/features/provider/hooks/use-job-detail-handlers';
import { buildProviderTimeline } from '~/features/provider/utils/job-timeline';
import { JobFeedbackCard } from '~/features/feedback/components/job-feedback-card';

const BRAND = '#F97316';

export default function ProviderJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { job, loading, actionLoading, error, accept, decline, start, complete } =
    useProviderJobDetail(id);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [completionNote, setCompletionNote] = useState('');

  const { handleAccept, handleDecline, handleStart, handleComplete } = useJobDetailHandlers({
    accept,
    decline,
    start,
    complete,
    onBack: () => router.back(),
  });

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={BRAND} />
        <Text className="text-sm text-muted-foreground mt-3">Đang tải công việc...</Text>
      </View>
    );
  }

  if (error || !job) return <DetailNotFound onBack={() => router.back()} />;

  const category = getCategoryConfig(job.serviceCategory);
  const fullAddress = [job.address, job.district].filter(Boolean).join(', ');
  const isAssigned = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(job.status);

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
          <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b' }} numberOfLines={1}>
            {job.serviceName}
          </RNText>
          <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>
            #{job.id.slice(-8).toUpperCase()}
          </RNText>
        </View>
        {actionLoading && (
          <ActivityIndicator size="small" color={BRAND} style={{ marginLeft: 8 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero card */}
        <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-6">
          <View
            className={category.bgClass}
            style={{ width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}
          >
            <Feather name={category.icon as never} size={24} color={category.iconColor} />
          </View>
          <View className="flex-1">
            <RNText style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 2 }}>Loại dịch vụ</RNText>
            <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b' }}>
              {category.label}
            </RNText>
          </View>
          <JobStatusBadge status={job.status} />
        </View>

        {/* Job details */}
        <DetailSection title="Chi tiết yêu cầu">
          <DetailInfoRow icon="file-text" label="Dịch vụ" value={job.serviceName} />
          {!!job.description && (
            <DetailInfoRow icon="align-left" label="Mô tả" value={job.description} />
          )}
          {!!fullAddress && <DetailInfoRow icon="map-pin" label="Địa chỉ" value={fullAddress} />}
          {!!job.estimatedPrice && (
            <DetailInfoRow
              icon="dollar-sign"
              label="Giá ước tính"
              value={`${job.estimatedPrice.toLocaleString('vi-VN')}đ`}
            />
          )}
          <DetailInfoRow
            icon={job.requestType === 'URGENT' ? 'zap' : 'calendar'}
            label="Loại yêu cầu"
            value={job.requestType === 'URGENT' ? '⚡ Gấp — ưu tiên xử lý ngay' : 'Thông thường'}
          />
          <DetailInfoRow icon="clock" label="Đăng lúc" value={getRelativeTime(job.createdAt)} />
          {!!job.note && (
            <DetailInfoRow icon="message-circle" label="Ghi chú của khách" value={job.note} />
          )}
        </DetailSection>

        {/* Customer info — visible only after accepting */}
        {isAssigned && (
          <DetailSection title="Thông tin khách hàng">
            <DetailInfoRow icon="user" label="Tên khách" value={job.customerName} />
            {!!job.customerPhone && (
              <DetailInfoRow icon="phone" label="Số điện thoại" value={job.customerPhone} />
            )}
          </DetailSection>
        )}

        {/* Completion summary */}
        {job.status === 'COMPLETED' && (
          <DetailSection title="Kết quả">
            {!!job.completedAt && (
              <DetailInfoRow
                icon="check-circle"
                label="Hoàn thành lúc"
                value={getRelativeTime(job.completedAt)}
              />
            )}
            {!!job.completionNote && (
              <DetailInfoRow
                icon="message-square"
                label="Ghi chú hoàn thành"
                value={job.completionNote}
              />
            )}
          </DetailSection>
        )}

        {/* Customer feedback — visible once job is completed */}
        {job.status === 'COMPLETED' && <JobFeedbackCard requestId={job.id} />}

        {/* Timeline */}
        <DetailSection title="Tiến trình">
          <StatusTimeline events={buildProviderTimeline(job)} />
        </DetailSection>

        {/* Actions */}
        <JobDetailActions
          status={job.status}
          actionLoading={actionLoading}
          showNoteInput={showNoteInput}
          completionNote={completionNote}
          onNoteChange={setCompletionNote}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onStart={handleStart}
          onShowNote={() => setShowNoteInput(true)}
          onCancelNote={() => { setShowNoteInput(false); setCompletionNote(''); }}
          onComplete={() => handleComplete(completionNote, () => {
            setShowNoteInput(false);
            setCompletionNote('');
          })}
        />
      </ScrollView>
    </View>
  );
}
