import { FlatList, RefreshControl, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { JobCard } from '~/features/provider/components/job-card';
import { JobsEmptyState } from '~/features/provider/components/jobs-empty-state';
import { JobsFilterBar } from '~/features/provider/components/jobs-filter-bar';
import { useProviderJobs } from '~/features/provider/hooks/use-provider-jobs';
import { useRouter } from 'expo-router';

const BRAND = '#F97316';

export default function ProviderJobsScreen() {
  const router = useRouter();
  const {
    filtered, filter, setFilter, counts,
    refreshing, refresh,
    acceptJob, declineJob, startJob, completeJob,
  } = useProviderJobs();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-safe px-4 pb-3">
        <Text className="text-2xl font-bold text-foreground py-3">Công việc</Text>
        <JobsFilterBar filter={filter} counts={counts} onFilter={setFilter} />
      </View>

      {/* Job list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={(id) => router.push(`/jobs/${id}` as never)}
            onAccept={filter === 'available' ? acceptJob : undefined}
            onDecline={filter === 'available' ? declineJob : undefined}
            onStart={filter === 'active' ? startJob : undefined}
            onComplete={filter === 'active' ? completeJob : undefined}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={BRAND} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<JobsEmptyState filter={filter} />}
      />
    </View>
  );
}
