import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { DashboardActiveJobs } from '~/features/provider/components/dashboard-active-jobs';
import { DashboardAvailableJobs } from '~/features/provider/components/dashboard-available-jobs';
import { ProviderHeader } from '~/features/provider/components/provider-header';
import { ProviderStatsRow } from '~/features/provider/components/provider-stats-row';
import { useProviderJobs } from '~/features/provider/hooks/use-provider-jobs';

const BRAND = '#F97316';

export default function ProviderDashboard() {
  const { jobs, counts, refreshing, refresh, acceptJob, declineJob, startJob, completeJob } =
    useProviderJobs();
  const [isOnline, setIsOnline] = React.useState(true);

  const activeJobs = jobs.filter((j) => ['ASSIGNED', 'IN_PROGRESS'].includes(j.status));
  const todayCompleted = jobs.filter((j) => j.status === 'COMPLETED').length;

  return (
    <View className="flex-1 bg-background">
      <ProviderHeader isOnline={isOnline} onToggleOnline={() => setIsOnline((v) => !v)} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={BRAND} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProviderStatsRow counts={counts} todayCompleted={todayCompleted} />

        <DashboardActiveJobs
          activeJobs={activeJobs}
          onStart={startJob}
          onComplete={completeJob}
        />

        <DashboardAvailableJobs
          jobs={jobs}
          counts={counts}
          onAccept={acceptJob}
          onDecline={declineJob}
        />
      </ScrollView>
    </View>
  );
}
