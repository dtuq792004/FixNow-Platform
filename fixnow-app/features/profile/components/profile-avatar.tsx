import { Text as RNText, View } from 'react-native';
import type { AuthUser } from '~/features/auth/types/auth.types';

const getInitials = (user: AuthUser): string => {
  if (user.fullName?.trim()) {
    const parts = user.fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return user.fullName.slice(0, 2).toUpperCase();
  }
  return (user.email?.slice(0, 2) ?? '??').toUpperCase();
};

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: 'Khách hàng',
  PROVIDER: 'Thợ kỹ thuật',
  ADMIN: 'Quản trị viên',
};

interface ProfileAvatarProps {
  user: AuthUser;
}

export const ProfileAvatar = ({ user }: ProfileAvatarProps) => (
  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
    {/* Circle */}
    <View style={{
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: '#18181b',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 14,
      shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    }}>
      <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 26 }}>
        {getInitials(user)}
      </RNText>
    </View>

    {/* Name */}
    <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b', marginBottom: 3 }}>
      {user.fullName || 'Người dùng'}
    </RNText>

    {/* Email */}
    <RNText style={{ fontSize: 13, color: '#71717a', marginBottom: 10 }}>
      {user.email}
    </RNText>

    {/* Badges row */}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{
        paddingHorizontal: 10, paddingVertical: 4,
        backgroundColor: '#f4f4f5', borderRadius: 20,
      }}>
        <RNText style={{ fontSize: 11, fontWeight: '600', color: '#52525b' }}>
          {ROLE_LABEL[user.role] ?? user.role}
        </RNText>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 5 }} />
        <RNText style={{ fontSize: 11, color: '#71717a' }}>Đang hoạt động</RNText>
      </View>
    </View>
  </View>
);
