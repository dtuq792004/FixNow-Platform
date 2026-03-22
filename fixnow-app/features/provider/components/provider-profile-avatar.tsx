import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
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

type Props = { user: AuthUser | null };

export function ProviderProfileAvatar({ user }: Props) {
  const initials = user ? getInitials(user) : '??';

  return (
    <View className="items-center pb-6 px-4">
      <View
        style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: BRAND,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{initials}</Text>
      </View>

      <Text className="text-xl font-bold text-foreground mb-1">
        {user?.fullName ?? 'Chưa cập nhật'}
      </Text>
      <Text className="text-sm text-muted-foreground mb-3">{user?.email}</Text>

      <View
        style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#fff7ed',
          paddingHorizontal: 12, paddingVertical: 5,
          borderRadius: 12,
        }}
      >
        <Feather name="shield" size={13} color={BRAND} style={{ marginRight: 5 }} />
        <Text style={{ fontSize: 12, fontWeight: '600', color: BRAND }}>
          Thợ được xác nhận
        </Text>
      </View>
    </View>
  );
}
