import { Feather } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

interface SearchInputProps {
  value: string;
  onChangeText: (t: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchInput = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Tìm dịch vụ hoặc thợ kỹ thuật...',
  autoFocus = false,
}: SearchInputProps) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f4f4f5', borderRadius: 14,
    paddingHorizontal: 12, height: 46,
  }}>
    <Feather name="search" size={18} color="#a1a1aa" style={{ marginRight: 8 }} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#a1a1aa"
      autoFocus={autoFocus}
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
      style={{ flex: 1, fontSize: 15, color: '#18181b', paddingVertical: 0 }}
    />
    {value.length > 0 && (
      <Pressable onPress={onClear} hitSlop={8} accessibilityLabel="Xóa tìm kiếm">
        <View style={{
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: '#a1a1aa', alignItems: 'center', justifyContent: 'center',
        }}>
          <Feather name="x" size={11} color="#ffffff" />
        </View>
      </Pressable>
    )}
  </View>
);
