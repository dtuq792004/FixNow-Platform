import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { useUser } from '~/features/auth/stores/auth.store';
import { getGreeting } from '~/features/home/utils/format-time';
import type { AuthUser } from '~/features/auth/types/auth.types';

const getInitials = (user: AuthUser): string => {
  if (user.fullName) {
    const parts = user.fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
};

export const HomeHeader = () => {
  const user = useUser();
  const router = useRouter();
  const greeting = getGreeting();
  const displayName = user?.fullName?.split(' ').pop() ?? user?.email ?? '';
  const initials = user ? getInitials(user) : '?';

  return (
    <View className="flex-row items-center justify-between pt-safe py-6 px-4 z-10">
      {/* Left: greeting + name */}
      <View className="flex-1">
        <Text className="text-sm text-muted-foreground">{greeting},</Text>
        <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {/* Right: notification + avatar */}
      <View className="flex-row items-center gap-3">
        <Pressable
          className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
          accessibilityLabel="Thông báo"
        >
          <Feather name="bell" size={20} color="#374151" />
        </Pressable>

        <Pressable
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityLabel="Tài khoản của tôi"
          accessibilityRole="button"
        >
          <Text className="text-primary-foreground text-sm font-bold">{initials}</Text>
        </Pressable>
      </View>
    </View>
  );
};
