import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';
import { getCategoryConfig } from '~/features/home/data/service-categories';
import { getRelativeTime } from '~/features/home/utils/format-time';
import { RequestStatusBadge } from '~/features/home/components/request-status-badge';
import type { ServiceRequestDetail } from '~/features/requests/types';

const RECENT_COUNT = 3;

interface Props {
  requests: ServiceRequestDetail[];
}

export const ProfileRecentRequests = ({ requests }: Props) => {
  const router = useRouter();
  // Data arrives pre-sorted from useMyRequests (API returns desc createdAt)
  const recent = requests.slice(0, RECENT_COUNT);

  if (recent.length === 0) return null;

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
      {/* Section header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b' }}>Yêu cầu gần đây</RNText>
        <Pressable onPress={() => router.push('/(tabs)/requests' as never)}>
          <RNText style={{ fontSize: 13, color: '#71717a' }}>Xem tất cả</RNText>
        </Pressable>
      </View>

      {/* Rows */}
      <View style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 14, overflow: 'hidden' }}>
        {recent.map((req, index) => {
          const cat = getCategoryConfig(req.category);
          return (
            <Pressable
              key={req.id}
              onPress={() => router.push(`/requests/${req.id}` as never)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 14, paddingVertical: 12,
                borderBottomWidth: index < recent.length - 1 ? 1 : 0,
                borderBottomColor: '#e4e4e7',
              }}
            >
              {/* Category icon */}
              <View
                className={cat.bgClass}
                style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 }}
              >
                <Feather name={cat.icon as never} size={15} color={cat.iconColor} />
              </View>

              {/* Title + time */}
              <View style={{ flex: 1 }}>
                <RNText style={{ fontSize: 13, fontWeight: '600', color: '#18181b', marginBottom: 2 }} numberOfLines={1}>
                  {req.title}
                </RNText>
                <RNText style={{ fontSize: 11, color: '#a1a1aa' }}>
                  {getRelativeTime(req.created_at)}
                </RNText>
              </View>

              <RequestStatusBadge status={req.status} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
