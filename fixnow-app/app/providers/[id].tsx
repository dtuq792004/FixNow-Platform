import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategoryConfig } from '~/features/home/data/service-categories';
import { PublicProfileHero } from '~/features/provider/components/public-profile-hero';
import { PublicProfileReviews } from '~/features/provider/components/public-profile-reviews';
import { useProviderProfile } from '~/features/provider/hooks/use-provider-profile';

// ── Specialty chips ───────────────────────────────────────────────────────────
const SpecialtyChips = ({ categories }: { categories: Array<{ _id: string; name: string; type: string }> }) => (
  <View className="flex-row flex-wrap gap-2 mb-4">
    {categories.map((cat) => {
      const cfg = getCategoryConfig(cat.type as any);
      return (
        <View
          key={cat._id}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl ${cfg.bgClass}`}
        >
          <Feather name={cfg.icon as never} size={13} color={cfg.iconColor} />
          <RNText style={{ fontSize: 12, fontWeight: '600', color: cfg.iconColor }}>
            {cat.name}
          </RNText>
        </View>
      );
    })}
  </View>
);

// ── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({
  icon, label, value,
}: {
  icon: string; label: string; value: string;
}) => (
  <View className="flex-row py-2.5 border-b border-zinc-100">
    <View className="w-8 h-8 rounded-lg bg-zinc-100 items-center justify-center mr-3">
      <Feather name={icon as never} size={15} color="#71717a" />
    </View>
    <View className="flex-1">
      <RNText style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 1 }}>{label}</RNText>
      <RNText style={{ fontSize: 13, color: '#18181b', fontWeight: '500' }}>{value}</RNText>
    </View>
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, loading, error, refetch } = useProviderProfile(id ?? '');

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#18181b" />
        <RNText style={{ fontSize: 13, color: '#a1a1aa', marginTop: 12 }}>
          Đang tải hồ sơ...
        </RNText>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
          <Feather name="alert-circle" size={28} color="#ef4444" />
        </View>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 6 }}>
          Không tìm thấy thợ
        </RNText>
        <RNText style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginBottom: 20 }}>
          {error ?? 'Hồ sơ thợ không tồn tại hoặc đã bị xoá.'}
        </RNText>
        <View className="flex-row gap-3 w-full">
          <Pressable
            onPress={() => router.back()}
            className="flex-1 h-11 border border-zinc-200 rounded-xl items-center justify-center"
          >
            <RNText style={{ fontSize: 14, fontWeight: '600', color: '#3f3f46' }}>Quay lại</RNText>
          </Pressable>
          <Pressable
            onPress={refetch}
            className="flex-1 h-11 bg-zinc-900 rounded-xl items-center justify-center"
          >
            <RNText style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Thử lại</RNText>
          </Pressable>
        </View>
      </View>
    );
  }

  const workingAreaText = profile.workingAreas.length
    ? profile.workingAreas.join(', ')
    : 'Toàn quốc';

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center border-b border-zinc-100 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={() => router.back()} className="p-2 mr-1">
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View className="flex-1">
          <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b' }} numberOfLines={1}>
            Hồ sơ thợ kỹ thuật
          </RNText>
          <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>
            {profile.fullName}
          </RNText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <PublicProfileHero profile={profile} />

        {/* Specialties */}
        {profile.serviceCategories.length > 0 && (
          <>
            <RNText style={{ fontSize: 13, fontWeight: '700', color: '#71717a', letterSpacing: 0.4, marginBottom: 10 }}>
              CHUYÊN MÔN
            </RNText>
            <SpecialtyChips categories={profile.serviceCategories} />
          </>
        )}

        {/* Info */}
        <View className="border border-zinc-200 rounded-2xl overflow-hidden mb-6">
          <View className="bg-zinc-50 px-4 py-2.5">
            <RNText style={{ fontSize: 12, fontWeight: '700', color: '#71717a', letterSpacing: 0.4 }}>
              THÔNG TIN
            </RNText>
          </View>
          <View className="px-4">
            <InfoRow icon="clock" label="Kinh nghiệm" value={`${profile.experienceYears} năm`} />
            <InfoRow icon="map-pin" label="Khu vực hoạt động" value={workingAreaText} />
            {!!profile.description && (
              <InfoRow icon="file-text" label="Giới thiệu" value={profile.description} />
            )}
          </View>
        </View>

        {/* Reviews */}
        <PublicProfileReviews
          reviews={profile.recentReviews}
          reviewCount={profile.reviewCount}
        />
      </ScrollView>
    </View>
  );
}
