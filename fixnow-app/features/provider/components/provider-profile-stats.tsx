import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { JobCounts } from '~/features/provider/hooks/use-provider-jobs';

type Props = { counts: JobCounts };

export function ProviderProfileStats({ counts }: Props) {
  const stats = [
    { label: 'Đã hoàn thành', value: counts.completed },
    { label: 'Đang làm', value: counts.active },
    { label: 'Đánh giá', value: '4.9 ⭐' },
  ];

  return (
    <View className="flex-row mx-4 gap-3 mb-6">
      {stats.map((s) => (
        <View
          key={s.label}
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#f3f4f6',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>
            {s.value}
          </Text>
          <Text
            style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, textAlign: 'center' }}
          >
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
