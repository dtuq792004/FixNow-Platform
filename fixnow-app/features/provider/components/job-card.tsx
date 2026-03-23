import { Feather } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import type { ProviderJob } from '~/features/provider/types/job.types';

const BRAND = '#F97316';

const CATEGORY_ICON: Record<string, string> = {
  plumbing: 'droplet',
  electrical: 'zap',
  hvac: 'wind',
  painting: 'edit-2',
  carpentry: 'box',
  cleaning: 'trash-2',
  appliance: 'cpu',
};

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', color: '#D97706', bg: '#fffbeb' },
  ASSIGNED: { label: 'Đã nhận', color: '#2563EB', bg: '#eff6ff' },
  IN_PROGRESS: { label: 'Đang làm', color: '#059669', bg: '#f0fdf4' },
  COMPLETED: { label: 'Hoàn thành', color: '#6b7280', bg: '#f9fafb' },
  CANCELLED: { label: 'Đã hủy', color: '#dc2626', bg: '#fef2f2' },
};

type Props = {
  job: ProviderJob;
  onPress?: (id: string) => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
};

export function JobCard({ job, onPress, onAccept, onDecline, onStart, onComplete }: Props) {
  const statusCfg = STATUS_CONFIG[job.status];
  const icon = (CATEGORY_ICON[job.serviceCategory] ?? 'tool') as any;

  const formatPrice = (p?: number) =>
    p ? `${(p / 1000).toFixed(0)}k` : 'Thỏa thuận';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 60000);
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

  return (
    <Pressable
      onPress={() => onPress?.(job.id)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: '#fff7ed',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 12,
        }}>
          <Feather name={icon} size={18} color={BRAND} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827', marginBottom: 2 }}>
            {job.serviceName}
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>{job.customerName}</Text>
        </View>

        {/* Status badge */}
        <View style={{ backgroundColor: statusCfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: statusCfg.color }}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Feather name="map-pin" size={13} color="#9ca3af" style={{ marginRight: 5 }} />
        <Text style={{ fontSize: 13, color: '#4b5563', flex: 1 }} numberOfLines={1}>
          {job.address}, {job.district}
        </Text>
      </View>

      {/* Description */}
      <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>
        {job.description}
      </Text>

      {/* Footer: price + time + urgent badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>{formatPrice(job.estimatedPrice)}</Text>
          {job.requestType === 'URGENT' && (
            <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, color: '#dc2626', fontWeight: '600' }}>⚡ Gấp</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(job.createdAt)}</Text>
      </View>

      {/* Action buttons */}
      {job.status === 'PENDING' && (onAccept || onDecline) && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl"
            onPress={() => onDecline?.(job.id)}
          >
            <Text className="text-sm font-medium">Từ chối</Text>
          </Button>
          <Button
            variant="brand"
            size="sm"
            className="flex-1 rounded-xl"
            onPress={() => onAccept?.(job.id)}
          >
            <Text className="text-sm font-semibold text-white">Nhận việc</Text>
          </Button>
        </View>
      )}

      {job.status === 'ASSIGNED' && onStart && (
        <View style={{ marginTop: 12 }}>
          <Button variant="brand" size="sm" className="rounded-xl flex-row" onPress={() => onStart(job.id)}>
            <Feather name="play-circle" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text className="text-sm font-semibold text-white">Bắt đầu làm việc</Text>
          </Button>
        </View>
      )}

      {job.status === 'IN_PROGRESS' && onComplete && (
        <View style={{ marginTop: 12 }}>
          <Button variant="brand" size="sm" className="rounded-xl flex-row" onPress={() => onComplete(job.id)}>
            <Feather name="check-circle" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text className="text-sm font-semibold text-white">Hoàn thành</Text>
          </Button>
        </View>
      )}
    </Pressable>
  );
}
