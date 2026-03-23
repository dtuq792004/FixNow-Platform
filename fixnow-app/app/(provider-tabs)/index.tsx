import React from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { DashboardActiveJobs } from '~/features/provider/components/dashboard-active-jobs';
import { DashboardAvailableJobs } from '~/features/provider/components/dashboard-available-jobs';
import { ProviderHeader } from '~/features/provider/components/provider-header';
import { ProviderStatsRow } from '~/features/provider/components/provider-stats-row';
import { useProviderJobs } from '~/features/provider/hooks/use-provider-jobs';
import { useProviderStatus } from '~/features/provider/hooks/use-provider-status';

const BRAND = '#F97316';

export default function ProviderDashboard() {
  const { jobs, counts, refreshing, refresh, acceptJob, declineJob, startJob, completeJob } =
    useProviderJobs();
  const {
    providerStatus,
    isLoading: statusLoading,
    isUpdating,
    reload: reloadStatus,
    updateStatus,
  } = useProviderStatus();

  const activeJobs = jobs.filter((j) => ['ASSIGNED', 'IN_PROGRESS'].includes(j.status));
  const todayCompleted = jobs.filter((j) => j.status === 'COMPLETED').length;

  // null during initial load → keep current display state as undefined (header handles it)
  const isOnline = statusLoading ? undefined : providerStatus?.activeStatus === 'ONLINE';

  const handleToggleOnline = async () => {
    if (!providerStatus || isUpdating) return;

    const newStatus = providerStatus.activeStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await updateStatus(newStatus);
    } catch {
      Alert.alert(
        'Không thể cập nhật trạng thái',
        'Vui lòng kiểm tra kết nối mạng và thử lại.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refresh(), reloadStatus()]);
  };

  return (
    <View className="flex-1 bg-background">
      <ProviderHeader
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        isLoading={isUpdating}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BRAND} />
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

