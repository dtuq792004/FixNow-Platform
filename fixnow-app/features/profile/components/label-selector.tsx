import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import { ADDRESS_LABEL_MAP, type SavedAddress } from '~/features/profile/types';

const LABEL_OPTIONS: SavedAddress['label'][] = ['home', 'work', 'other'];

interface LabelSelectorProps {
  value: SavedAddress['label'];
  onChange: (v: SavedAddress['label']) => void;
}

export const LabelSelector = ({ value, onChange }: LabelSelectorProps) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {LABEL_OPTIONS.map((opt) => {
      const isActive = opt === value;
      const meta = ADDRESS_LABEL_MAP[opt];
      return (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={{
            flex: 1, height: 38, borderRadius: 10,
            borderWidth: 1.5,
            borderColor: isActive ? '#18181b' : '#e4e4e7',
            backgroundColor: isActive ? '#18181b' : '#fff',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', gap: 5,
          }}
        >
          <Feather name={meta.icon as never} size={13} color={isActive ? '#fff' : '#71717a'} />
          <RNText style={{ fontSize: 12, fontWeight: '600', color: isActive ? '#fff' : '#71717a' }}>
            {meta.text}
          </RNText>
        </Pressable>
      );
    })}
  </View>
);
