import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Skeleton } from '~/components/ui/skeleton';
import { Text } from '~/components/ui/text';
import type { ServiceRequest } from '~/features/home/types';
import { RequestCard } from './request-card';

interface RecentRequestsSectionProps {
  requests: ServiceRequest[];
  isLoading: boolean;
}

const RequestCardSkeleton = () => (
  <View className="bg-card border border-border rounded-xl p-4 mb-3">
    <View className="flex-row items-start">
      <Skeleton className="w-10 h-10 rounded-xl mr-3" />
      <View className="flex-1">
        <Skeleton className="h-4 rounded w-3/4 mb-2" />
        <Skeleton className="h-3 rounded w-1/3" />
      </View>
      <Skeleton className="h-6 w-24 rounded-full" />
    </View>
    <View className="flex-row justify-between mt-3 pt-3 border-t border-border">
      <Skeleton className="h-3 w-20 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </View>
  </View>
);

const EmptyState = () => {
  const router = useRouter();

  return (
    <View className="items-center py-8 px-4">
      <View className="w-16 h-16 bg-secondary rounded-full items-center justify-center mb-4">
        <Feather name="clipboard" size={28} color="#9CA3AF" />
      </View>
      <Text className="text-sm font-medium text-foreground mb-1">Chưa có yêu cầu nào</Text>
      <Text className="text-xs text-muted-foreground text-center mb-4">
        Tạo yêu cầu đầu tiên để được hỗ trợ sửa chữa tận nơi
      </Text>
      <Pressable
        className="bg-primary rounded-xl px-5 py-2.5 active:opacity-80"
        onPress={() => router.push('/requests/create' as never)}
      >
        <Text className="text-primary-foreground text-xs font-semibold">Tạo yêu cầu ngay</Text>
      </Pressable>
    </View>
  );
};

export const RecentRequestsSection = ({ requests, isLoading }: RecentRequestsSectionProps) => {
  const router = useRouter();
  const displayRequests = requests.slice(0, 3);

  return (
    <View className="mb-6">
      {/* Section header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-foreground">Yêu cầu gần đây</Text>
        {requests.length > 0 && (
          <Pressable
            className="flex-row items-center active:opacity-70"
            onPress={() => router.push('/(tabs)/requests' as never)}
          >
            <Text className="text-xs text-primary mr-1">Xem tất cả</Text>
            <Feather name="chevron-right" size={14} color="#1a1a1a" />
          </Pressable>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <>
          <RequestCardSkeleton />
          <RequestCardSkeleton />
        </>
      ) : displayRequests.length > 0 ? (
        displayRequests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))
      ) : (
        <View className="bg-card border border-border rounded-xl overflow-hidden">
          <EmptyState />
        </View>
      )}
    </View>
  );
};
