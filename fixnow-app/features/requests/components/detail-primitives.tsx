import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';

/** Shared section header + wrapper used across request detail sub-sections */
export const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ marginBottom: 20 }}>
    <RNText style={{
      fontSize: 13, fontWeight: '600', color: '#71717a', marginBottom: 10,
      textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      {title}
    </RNText>
    {children}
  </View>
);

/** Single icon + label + value row inside a detail section */
export const DetailInfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
    <View style={{
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center',
      marginRight: 10, flexShrink: 0,
    }}>
      <Feather name={icon as never} size={14} color="#52525b" />
    </View>
    <View style={{ flex: 1 }}>
      <RNText style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 1 }}>{label}</RNText>
      <RNText style={{ fontSize: 14, color: '#18181b', lineHeight: 20 }}>{value}</RNText>
    </View>
  </View>
);

/** Full-screen not-found fallback */
export const DetailNotFound = ({ onBack }: { onBack: () => void }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
    <Feather name="alert-circle" size={48} color="#a1a1aa" />
    <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181b', marginTop: 16, marginBottom: 8 }}>
      Không tìm thấy yêu cầu
    </RNText>
    <RNText style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginBottom: 24 }}>
      Yêu cầu này không tồn tại hoặc đã bị xoá
    </RNText>
    <Pressable
      onPress={onBack}
      style={{ backgroundColor: '#18181b', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
    >
      <RNText style={{ color: '#fff', fontWeight: '600' }}>Quay lại</RNText>
    </Pressable>
  </View>
);
