import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignOut, useUser } from '~/features/auth/stores/auth.store';
import { BecomeProviderBanner } from '~/features/profile/components/become-provider-banner';
import { ProfileAvatar } from '~/features/profile/components/profile-avatar';
import { ProfileRecentRequests } from '~/features/profile/components/profile-recent-requests';
import { ProfileStatsRow } from '~/features/profile/components/profile-stats-row';
import { SettingsMenu } from '~/features/profile/components/settings-menu';
import { useMyRequests } from '~/features/requests/hooks/use-my-requests';
import { ACTIVE_STATUSES } from '~/features/requests/types';

const ProfileScreen = () => {
  const user = useUser();
  const router = useRouter();
  const signOut = useSignOut();
  const { requests, isLoading } = useMyRequests();

  const stats = useMemo(() => ({
    total:     requests.length,
    active:    requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  }), [requests]);

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => { await signOut(); },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Safe-area header bar ───────────────────────────────────────────── */}
      <View className="pt-safe px-5 pb-2 flex-row items-center justify-between border-b border-border">
        <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b' }}>Tài khoản</RNText>
        <Pressable
          onPress={() => router.push('/profile/personal-info')}
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center',
          }}
          accessibilityLabel="Chỉnh sửa hồ sơ"
        >
          <Feather name="edit-2" size={16} color="#52525b" />
        </Pressable>
      </View>

      {/* ── Avatar + user info ─────────────────────────────────────────────── */}
      <ProfileAvatar user={user} />

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <ProfileStatsRow
        total={stats.total}
        active={stats.active}
        completed={stats.completed}
        isLoading={isLoading}
      />

      {/* ── Recent requests ───────────────────────────────────────────────── */}
      <ProfileRecentRequests requests={requests} />

      {/* ── Settings ──────────────────────────────────────────────────────── */}
      <SettingsMenu onPress={(id) => {
        if (id === 'personal') router.push('/profile/personal-info');
        else if (id === 'address') router.push('/profile/addresses');
      }} />

      {/* ── Become provider CTA ───────────────────────────────────────────── */}
      {user.role === 'CUSTOMER' && <BecomeProviderBanner />}

      {/* ── Sign out ──────────────────────────────────────────────────────── */}
      <Pressable
        onPress={handleSignOut}
        style={{
          marginHorizontal: 16,
          height: 48, borderRadius: 12,
          borderWidth: 1, borderColor: '#fecaca',
          backgroundColor: '#fff5f5',
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        }}
        accessibilityRole="button"
        accessibilityLabel="Đăng xuất"
      >
        <Feather name="log-out" size={17} color="#ef4444" />
        <RNText style={{ color: '#ef4444', fontWeight: '600', fontSize: 14, marginLeft: 7 }}>
          Đăng xuất
        </RNText>
      </Pressable>
    </ScrollView>
  );
};

export default ProfileScreen;
