import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { ModeSwitcher } from '~/features/app/components/mode-switcher';
import { useUser } from '~/features/auth/stores/auth.store';
import type { AuthUser } from '~/features/auth/types/auth.types';

const BRAND = '#F97316';

const getInitials = (user: AuthUser) => {
  if (user.fullName) {
    const parts = user.fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return user.fullName.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
};

type Props = {
  isOnline: boolean;
  onToggleOnline: () => void;
  toggling?: boolean;
};

export function ProviderHeader({ isOnline, onToggleOnline, toggling = false }: Props) {
  const user = useUser();
  const router = useRouter();
  const initials = user ? getInitials(user) : '??';
  const displayName = user?.fullName?.split(' ').pop() ?? user?.email ?? '';

  return (
    <View className="pt-safe px-4 pb-2">
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-1">
          <Text className="text-sm text-muted-foreground">Chế độ thợ</Text>
          <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Online toggle */}
          <Pressable
            onPress={onToggleOnline}
            disabled={toggling}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: isOnline ? '#f0fdf4' : '#f9fafb',
              borderWidth: 1,
              borderColor: isOnline ? '#bbf7d0' : '#e5e7eb',
              opacity: toggling ? 0.6 : 1,
            }}
          >
            <View
              style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: isOnline ? '#22c55e' : '#9ca3af',
                marginRight: 5,
              }}
            />
            <Text
              style={{
                fontSize: 12, fontWeight: '600',
                color: isOnline ? '#15803d' : '#6b7280',
              }}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </Pressable>

          {/* Avatar */}
          <Pressable
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: BRAND }}
            onPress={() => router.push('/(provider-tabs)/profile')}
            accessibilityRole="button"
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
              {initials}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Mode switcher */}
      <View className="pb-2">
        <ModeSwitcher />
      </View>
    </View>
  );
}
