import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { JobCard } from "~/features/provider/components/job-card";
import { JobsEmptyState } from "~/features/provider/components/jobs-empty-state";
import { JobsFilterBar } from "~/features/provider/components/jobs-filter-bar";
import { useProviderJobs } from "~/features/provider/hooks/use-provider-jobs";
import { useRouter } from "expo-router";
import { useState } from "react";

const BRAND = "#F97316";

export default function ProviderJobsScreen() {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const {
    filtered,
    filter,
    setFilter,
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



  const handleAccept = async (id: string) => {
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
  };

  const handleDecline = async (id: string) => {
    try {
      setActionLoading(id);
      await declineJob(id);
    } catch (err: any) {
      console.error("❌ Decline error:", err);
      Alert.alert(
        "Lỗi",
        err.message || "Không thể từ chối việc. Vui lòng thử lại.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (id: string) => {
    try {
      setActionLoading(id);
      await startJob(id);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err.message || "Không thể bắt đầu việc. Vui lòng thử lại.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setActionLoading(id);
      await completeJob(id);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err.message || "Không thể hoàn thành việc. Vui lòng thử lại.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && filtered.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-safe px-4 pb-3">
        <Text className="text-2xl font-bold text-foreground py-3">
          Công việc
        </Text>
        <JobsFilterBar filter={filter} counts={counts} onFilter={setFilter} />
      </View>

      {error && (
        <View className="bg-red-50 px-4 py-2 border-b border-red-200">
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      {/* Job list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={(id) => router.push(`/jobs/${id}` as never)}
            onAccept={filter === "available" ? handleAccept : undefined}
            onDecline={filter === "available" ? handleDecline : undefined}
            onStart={filter === "active" ? handleStart : undefined}
            onComplete={filter === "active" ? handleComplete : undefined}
            isLoading={actionLoading === item.id}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={BRAND}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<JobsEmptyState filter={filter} />}
      />
    </View>
  );
}
