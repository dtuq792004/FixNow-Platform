import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { JobCard } from '~/features/provider/components/job-card';
import type { ProviderJob } from '~/features/provider/data/mock-provider-jobs';
import type { JobCounts } from '~/features/provider/hooks/use-provider-jobs';

const BRAND = '#F97316';

type Props = {
  jobs: ProviderJob[];
  counts: JobCounts;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
};

export function DashboardAvailableJobs({ jobs, counts, onAccept, onDecline }: Props) {
  const router = useRouter();
  const pendingJobs = jobs.filter((j) => j.status === 'PENDING').slice(0, 3);

  return (
    <View className="px-4 pb-8">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-foreground">Yêu cầu mới</Text>
        {counts.available > 0 && (
          <View
            style={{
              backgroundColor: BRAND,
              borderRadius: 10,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {counts.available}
            </Text>
          </View>
        )}
      </View>

      {pendingJobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onPress={(id) => router.push(`/jobs/${id}` as never)}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ))}

      {counts.available === 0 && (
        <View className="bg-secondary rounded-2xl p-6 items-center">
          <Feather name="inbox" size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
          <Text className="text-muted-foreground text-sm text-center">Chưa có yêu cầu mới</Text>
        </View>
      )}
    </View>
  );
}
