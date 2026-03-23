import { Feather } from '@expo/vector-icons';
import { View, Text as RNText } from 'react-native';

const BRAND = '#F97316';
const DECO = 'rgba(255,255,255,0.15)';

type AuthHeroProps = {
  subtitle: string;
};

export function AuthHero({ subtitle }: AuthHeroProps) {
  return (
    <View style={{ backgroundColor: BRAND, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 44, overflow: 'hidden' }}>
      {/* Decorative circles */}
      <View style={{ position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: DECO }} />
      <View style={{ position: 'absolute', right: 60, top: 50, width: 80, height: 80, borderRadius: 40, backgroundColor: DECO }} />
      <View style={{ position: 'absolute', left: -30, bottom: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: DECO }} />

      {/* Logo row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          width: 48, height: 48, borderRadius: 14,
          backgroundColor: '#fff',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 12,
          shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
        }}>
          <Feather name="tool" size={24} color={BRAND} />
        </View>
        <RNText style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
          FixNow
        </RNText>
      </View>

      {/* Subtitle */}
      <RNText style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 22 }}>
        {subtitle}
      </RNText>
    </View>
  );
}
