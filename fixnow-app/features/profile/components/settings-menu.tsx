import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import { PROFILE_SETTINGS } from '~/features/profile/data/profile-settings';

interface SettingsMenuProps {
  onPress?: (id: string) => void;
}

export const SettingsMenu = ({ onPress }: SettingsMenuProps) => (
  <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
    <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 10 }}>
      Cài đặt
    </RNText>

    <View style={{ backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 14, overflow: 'hidden' }}>
      {PROFILE_SETTINGS.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onPress?.(item.id)}
          style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 14, paddingVertical: 13,
            borderBottomWidth: index < PROFILE_SETTINGS.length - 1 ? 1 : 0,
            borderBottomColor: '#e4e4e7',
          }}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          {/* Icon */}
          <View style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: '#f4f4f5',
            alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
          }}>
            <Feather name={item.icon as never} size={16} color="#52525b" />
          </View>

          {/* Label + description */}
          <View style={{ flex: 1 }}>
            <RNText style={{ fontSize: 14, fontWeight: '500', color: '#18181b' }}>{item.label}</RNText>
            {item.description ? (
              <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>{item.description}</RNText>
            ) : null}
          </View>

          <Feather name="chevron-right" size={15} color="#d4d4d8" />
        </Pressable>
      ))}
    </View>
  </View>
);
