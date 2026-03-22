import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { JobCard } from '~/features/provider/components/job-card';
import type { ProviderJob } from '~/features/provider/data/mock-provider-jobs';

const BRAND = '#F97316';

type Props = {
  activeJobs: ProviderJob[];
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
};

export function DashboardActiveJobs({ activeJobs, onStart, onComplete }: Props) {
  const router = useRouter();

  return (
    <View className="px-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-foreground">Đang thực hiện</Text>
        <Text
          style={{ fontSize: 13, color: BRAND, fontWeight: '600' }}
          onPress={() => router.push('/(provider-tabs)/jobs')}
        >
          Tất cả
        </Text>
      </View>

      {activeJobs.length === 0 ? (
        <View className="bg-secondary rounded-2xl p-6 items-center">
          <Feather name="briefcase" size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
          <Text className="text-muted-foreground text-sm text-center">
            Không có công việc đang thực hiện
          </Text>
        </View>
      ) : (
        activeJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onPress={(id) => router.push(`/jobs/${id}` as never)}
            onStart={onStart}
            onComplete={onComplete}
          />
        ))
      )}
    </View>
  );
}
