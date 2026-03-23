import React from "react";
import {
  RefreshControl,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text } from "~/components/ui/text";
import { DashboardActiveJobs } from "~/features/provider/components/dashboard-active-jobs";
import { DashboardAvailableJobs } from "~/features/provider/components/dashboard-available-jobs";
import { ProviderHeader } from "~/features/provider/components/provider-header";
import { ProviderStatsRow } from "~/features/provider/components/provider-stats-row";
import { useProviderJobs } from "~/features/provider/hooks/use-provider-jobs";
import { useProviderProfile } from "~/features/provider/hooks/use-provider-profile";
import { useUser } from "~/features/auth/stores/auth.store";

const BRAND = "#F97316";

export default function ProviderDashboard() {
  const user = useUser();
  const {
    jobs,
    counts,
    refreshing,
    refresh,
    acceptJob,
    declineJob,
    startJob,
    completeJob,
    loading,
    error,
  } = useProviderJobs();
  const { updateStatus } = useProviderProfile();
  const [isOnline, setIsOnline] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const activeJobs = jobs.filter((j) =>
    ["ACCEPTED", "IN_PROGRESS"].includes(j.status),
  );
  const todayCompleted = jobs.filter((j) => j.status === "COMPLETED").length;

  const handleToggleOnline = React.useCallback(async () => {
    try {
      setToggling(true);
      const newStatus = isOnline ? "OFFLINE" : "ONLINE";
      await updateStatus(newStatus as "ONLINE" | "OFFLINE");
      setIsOnline(!isOnline);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setToggling(false);
    }
  }, [isOnline, updateStatus]);

  const handleAccept = React.useCallback(
    async (id: string) => {
      try {
        setActionLoading(id);
        await acceptJob(id);
      } catch (err: any) {
        Alert.alert(
          "Lỗi",
          err.message || "Không thể nhận việc. Vui lòng thử lại.",
        );
      } finally {
        setActionLoading(null);
      }
    },
    [acceptJob],
  );

  const handleDecline = React.useCallback(
    async (id: string) => {
      try {
        setActionLoading(id);
        await declineJob(id);
      } catch (err: any) {
        Alert.alert(
          "Lỗi",
          err.message || "Không thể từ chối việc. Vui lòng thử lại.",
        );
      } finally {
        setActionLoading(null);
      }
    },
    [declineJob],
  );

  if (loading && jobs.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={BRAND} />
        <Text className="mt-3 text-muted-foreground">
          Đang tải công việc...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ProviderHeader
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        toggling={toggling}
      />

      {error && (
        <View className="bg-red-50 px-4 py-2 border-b border-red-200">
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={BRAND}
          />
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
          onAccept={handleAccept}
          onDecline={handleDecline}
          actionLoading={actionLoading}
        />
      </ScrollView>
    </View>
  );
}
