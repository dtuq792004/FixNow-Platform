import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { CreateRequestBanner } from "~/features/home/components/create-request-banner";
import { HomeHeader } from "~/features/home/components/home-header";
import { QuickStatsRow } from "~/features/home/components/quick-stats-row";
import { RecentRequestsSection } from "~/features/home/components/recent-requests-section";
import { ServiceCategoryGrid } from "~/features/home/components/service-category-grid";
import { useHomeData } from "~/features/home/hooks/use-home-data";

const HomeScreen = () => {
  const { stats, recentRequests, isLoading, refetch } = useHomeData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View className="flex-1 bg-background">
      <HomeHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CreateRequestBanner />
        <ServiceCategoryGrid />
        <QuickStatsRow stats={stats} isLoading={isLoading} />
        <RecentRequestsSection
          requests={recentRequests}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
