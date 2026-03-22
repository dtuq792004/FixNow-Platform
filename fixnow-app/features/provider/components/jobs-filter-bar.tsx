import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { JobFilter, JobCounts } from '~/features/provider/hooks/use-provider-jobs';

const BRAND = '#F97316';

const FILTERS: { key: JobFilter; label: string }[] = [
  { key: 'available', label: 'Chờ nhận' },
  { key: 'active', label: 'Đang làm' },
  { key: 'completed', label: 'Đã xong' },
];

type Props = {
  filter: JobFilter;
  counts: JobCounts;
  onFilter: (f: JobFilter) => void;
};

export function JobsFilterBar({ filter, counts, onFilter }: Props) {
  return (
    <View className="flex-row gap-2">
      {FILTERS.map(({ key, label }) => {
        const active = filter === key;
        return (
          <Pressable
            key={key}
            onPress={() => onFilter(key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: active ? BRAND : '#f3f4f6',
              borderWidth: 1,
              borderColor: active ? BRAND : '#e5e7eb',
            }}
          >
            <Text
              style={{
                fontSize: 13, fontWeight: '600',
                color: active ? '#fff' : '#4b5563',
              }}
            >
              {label}
            </Text>
            {counts[key] > 0 && (
              <View
                style={{
                  marginLeft: 5,
                  backgroundColor: active ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 11, fontWeight: '700',
                    color: active ? '#fff' : '#6b7280',
                  }}
                >
                  {counts[key]}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
