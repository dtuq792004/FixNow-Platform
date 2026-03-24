import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { Text } from '~/components/ui/text';
import type { HomeStats } from '~/features/home/types';

interface StatCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
}

const StatCard = ({ icon, iconBg, iconColor, value, label }: StatCardProps) => (
  <Card className="flex-1">
    <CardContent className="p-4">
      <View className="flex-row items-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${iconBg}`}
        >
          <Feather name={icon as never} size={18} color={iconColor} />
        </View>
        <View>
          <Text className="text-2xl font-bold text-foreground">{value}</Text>
          <Text className="text-xs text-muted-foreground">{label}</Text>
        </View>
      </View>
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
  <Card className="flex-1">
    <CardContent className="p-4">
      <View className="flex-row items-center">
        <Skeleton className="w-10 h-10 rounded-full mr-3" />
        <View>
          <Skeleton className="h-7 w-8 rounded mb-1" />
          <Skeleton className="h-3 w-20 rounded" />
        </View>
      </View>
    </CardContent>
  </Card>
);

interface QuickStatsRowProps {
  stats: HomeStats;
  isLoading: boolean;
}

export const QuickStatsRow = ({ stats, isLoading }: QuickStatsRowProps) => (
  <View className="mb-6">
    <Text className="text-base font-semibold text-foreground mb-3">Tổng quan</Text>

    <View className="flex-row gap-3">
      {isLoading ? (
        <>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </>
      ) : (
        <>
          <StatCard
            icon="loader"
            iconBg="bg-blue-100"
            iconColor="#2563EB"
            value={stats.active}
            label="Đang xử lý"
          />
          <StatCard
            icon="check-circle"
            iconBg="bg-green-100"
            iconColor="#16A34A"
            value={stats.completed}
            label="Đã hoàn thành"
          />
        </>
      )}
    </View>
  </View>
);
