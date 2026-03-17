import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { getCategoryConfig } from '~/features/home/data/service-categories';
import { getRelativeTime } from '~/features/home/utils/format-time';
import type { ServiceRequest } from '~/features/home/types';
import { RequestStatusBadge } from './request-status-badge';

interface RequestCardProps {
  request: ServiceRequest;
}

export const RequestCard = ({ request }: RequestCardProps) => {
  const router = useRouter();
  const category = getCategoryConfig(request.category);

  const handlePress = () => {
    // TODO: navigate to request detail
    router.push(`/requests/${request.id}` as never);
  };

  return (
    <Pressable
      className="bg-card border border-border rounded-xl p-4 mb-3 active:opacity-80"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Yêu cầu: ${request.title}`}
    >
      {/* Top row: icon + title + status */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1 mr-3">
          {/* Category icon */}
          <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 mt-0.5 ${category.bgClass}`}>
            <Feather name={category.icon as never} size={18} color={category.iconColor} />
          </View>

          {/* Title + category */}
          <View className="flex-1">
            <Text
              className="text-sm font-semibold text-foreground leading-snug"
              numberOfLines={2}
            >
              {request.title}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{category.label}</Text>
          </View>
        </View>

        {/* Status badge */}
        <RequestStatusBadge status={request.status} />
      </View>

      {/* Bottom row: time + provider */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
        <View className="flex-row items-center">
          <Feather name="clock" size={12} color="#9CA3AF" />
          <Text className="text-xs text-muted-foreground ml-1">
            {getRelativeTime(request.created_at)}
          </Text>
        </View>

        {request.provider ? (
          <View className="flex-row items-center">
            <Feather name="user-check" size={12} color="#9CA3AF" />
            <Text className="text-xs text-muted-foreground ml-1" numberOfLines={1}>
              {request.provider.name}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Feather name="search" size={12} color="#9CA3AF" />
            <Text className="text-xs text-muted-foreground ml-1">Đang tìm thợ...</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};
