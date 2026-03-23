import { View, Text as RNText } from 'react-native';
import type { ProviderJobStatus } from '~/features/provider/types/job.types';

export const JOB_STATUS_CONFIG: Record<
  ProviderJobStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING:     { label: 'Chờ nhận',   color: '#D97706', bg: '#fffbeb' },
  ASSIGNED:    { label: 'Đã nhận',    color: '#2563EB', bg: '#eff6ff' },
  IN_PROGRESS: { label: 'Đang làm',   color: '#059669', bg: '#f0fdf4' },
  COMPLETED:   { label: 'Hoàn thành', color: '#6b7280', bg: '#f9fafb' },
  CANCELLED:   { label: 'Đã hủy',     color: '#dc2626', bg: '#fef2f2' },
};

export const JobStatusBadge = ({ status }: { status: ProviderJobStatus }) => {
  const cfg = JOB_STATUS_CONFIG[status];
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
      }}
    >
      <RNText style={{ fontSize: 12, fontWeight: '600', color: cfg.color }}>
        {cfg.label}
      </RNText>
    </View>
  );
};
