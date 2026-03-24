/**
 * Hero section for the public provider profile screen.
 * Shows avatar, name, verified badge, online status, rating.
 */
import { Feather } from '@expo/vector-icons';
import { Text as RNText, View } from 'react-native';
import type { PublicProviderProfile } from '../services/provider-public-profile.service';

interface Props {
  profile: Pick<
    PublicProviderProfile,
    'fullName' | 'avatar' | 'verified' | 'activeStatus' | 'avgRating' | 'reviewCount'
  >;
}

const StarRow = ({ rating, count }: { rating: number; count: number }) => (
  <View className="flex-row items-center mt-1 gap-1">
    <Feather name="star" size={14} color="#F59E0B" />
    <RNText style={{ fontSize: 14, fontWeight: '700', color: '#18181b' }}>
      {rating > 0 ? rating.toFixed(1) : '—'}
    </RNText>
    <RNText style={{ fontSize: 13, color: '#71717a' }}>
      · {count} đánh giá
    </RNText>
  </View>
);

const OnlineBadge = ({ status }: { status: 'ONLINE' | 'OFFLINE' }) => (
  <View
    className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
      status === 'ONLINE' ? 'bg-green-50' : 'bg-zinc-100'
    }`}
  >
    <View
      className={`w-2 h-2 rounded-full ${
        status === 'ONLINE' ? 'bg-green-500' : 'bg-zinc-400'
      }`}
    />
    <RNText
      style={{
        fontSize: 11,
        fontWeight: '600',
        color: status === 'ONLINE' ? '#16a34a' : '#71717a',
      }}
    >
      {status === 'ONLINE' ? 'Đang hoạt động' : 'Offline'}
    </RNText>
  </View>
);

export const PublicProfileHero = ({ profile }: Props) => (
  <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-6">
    {/* Avatar */}
    <View
      className="bg-zinc-900 items-center justify-center rounded-2xl mr-4"
      style={{ width: 64, height: 64 }}
    >
      <RNText style={{ color: '#fff', fontWeight: '700', fontSize: 24 }}>
        {profile.fullName.charAt(0)}
      </RNText>
    </View>

    {/* Info */}
    <View className="flex-1">
      {/* Name + verified */}
      <View className="flex-row items-center gap-2 mb-1">
        <RNText
          style={{ fontSize: 17, fontWeight: '700', color: '#18181b' }}
          numberOfLines={1}
        >
          {profile.fullName}
        </RNText>
        {profile.verified && (
          <View className="w-5 h-5 rounded-full bg-blue-600 items-center justify-center">
            <Feather name="check" size={11} color="#fff" />
          </View>
        )}
      </View>

      <StarRow rating={profile.avgRating} count={profile.reviewCount} />

      <View className="mt-2">
        <OnlineBadge status={profile.activeStatus} />
      </View>
    </View>
  </View>
);
