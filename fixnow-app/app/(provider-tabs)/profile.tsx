import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { ModeSwitcher } from '~/features/app/components/mode-switcher';
import { useSignOut, useUser } from '~/features/auth/stores/auth.store';
import { ProviderProfileAvatar } from '~/features/provider/components/provider-profile-avatar';
import { ProviderProfileMenu } from '~/features/provider/components/provider-profile-menu';
import { ProviderProfileStats } from '~/features/provider/components/provider-profile-stats';
import { useProviderJobs } from '~/features/provider/hooks/use-provider-jobs';

export default function ProviderProfileScreen() {
  const user = useUser();
  const signOut = useSignOut();
  const router = useRouter();
  const { counts } = useProviderJobs();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

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
      <ProviderProfileMenu onSignOut={handleSignOut} />
    </ScrollView>
  );
}
