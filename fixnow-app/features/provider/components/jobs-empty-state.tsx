import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { JobFilter } from '~/features/provider/hooks/use-provider-jobs';

const EMPTY_TEXT: Record<JobFilter, string> = {
  available: 'Chưa có yêu cầu mới',
  active: 'Không có việc đang làm',
  completed: 'Chưa có việc hoàn thành',
};

const EMPTY_ICON: Record<JobFilter, string> = {
  available: 'inbox',
  active: 'tool',
  completed: 'check-circle',
};

type Props = { filter: JobFilter };

export function JobsEmptyState({ filter }: Props) {
  return (
    <View className="items-center py-16">
      <Feather
        name={EMPTY_ICON[filter] as any}
        size={40}
        color="#d1d5db"
        style={{ marginBottom: 12 }}
      />
      <Text className="text-muted-foreground text-sm">{EMPTY_TEXT[filter]}</Text>
    </View>
  );
}
