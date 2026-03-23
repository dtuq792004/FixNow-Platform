import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { ModeSwitcher } from '~/features/app/components/mode-switcher';
import { useSignOut, useUser } from '~/features/auth/stores/auth.store';
import { ProviderProfileAvatar } from '~/features/provider/components/provider-profile-avatar';
import { ProviderProfileMenu } from '~/features/provider/components/provider-profile-menu';
import { ProviderProfileStats } from '~/features/provider/components/provider-profile-stats';
import { useProviderJobs } from '~/features/provider/hooks/use-provider-jobs';
import { useProviderProfile } from '~/features/provider/hooks/use-provider-profile';
import { useEffect } from 'react';

const BRAND = '#F97316';

export default function ProviderProfileScreen() {
  const user = useUser();
  const signOut = useSignOut();
  const router = useRouter();
  const { counts } = useProviderJobs();
  const { feedbacks, loading: feedbackLoading, fetchFeedbacks } = useProviderProfile();

  useEffect(() => {
    if (user?._id) {
      fetchFeedbacks(user._id);
    }
  }, [user?._id, fetchFeedbacks]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-safe px-4 pb-2">
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-2xl font-bold text-foreground">Hồ sơ thợ</Text>
          <ModeSwitcher />
        </View>
      </View>

      <ProviderProfileAvatar user={user} />
      <ProviderProfileStats counts={counts} />

      {/* Feedback Section */}
      <View className="px-4 py-4 border-t border-border">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-foreground">Đánh giá</Text>
          <View
            style={{
              backgroundColor: BRAND,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
              ⭐ {avgRating}
            </Text>
          </View>
        </View>

        {feedbackLoading ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color={BRAND} />
          </View>
        ) : feedbacks.length === 0 ? (
          <Text className="text-muted-foreground text-sm py-4">Chưa có đánh giá nào</Text>
        ) : (
          <View className="space-y-2">
            <Text className="text-sm text-muted-foreground">
              {feedbacks.length} đánh giá từ khách hàng
            </Text>
          </View>
        )}
      </View>

      <ProviderProfileMenu onSignOut={handleSignOut} />
    </ScrollView>
  );
}
