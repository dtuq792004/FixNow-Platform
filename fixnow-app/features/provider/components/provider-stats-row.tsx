import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { JobCounts } from '~/features/provider/hooks/use-provider-jobs';

const BRAND = '#F97316';

type Props = {
  counts: JobCounts;
  todayCompleted: number;
};

export function ProviderStatsRow({ counts, todayCompleted }: Props) {
  const stats = [
    { label: 'Chờ nhận', value: counts.available, icon: 'inbox', color: '#D97706' },
    { label: 'Đang làm', value: counts.active, icon: 'tool', color: BRAND },
    { label: 'Hôm nay', value: todayCompleted, icon: 'check-circle', color: '#059669' },
  ] as const;

  return (
    <View className="flex-row mx-4 gap-3 mb-6">
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#f3f4f6',
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Feather name={stat.icon as any} size={18} color={stat.color} style={{ marginBottom: 6 }} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>{stat.value}</Text>
          <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}
