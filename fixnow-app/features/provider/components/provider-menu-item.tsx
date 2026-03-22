import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';

type Props = {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
};

export function ProviderMenuItem({ icon, label, value, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white"
      style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
    >
      <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-3">
        <Feather name={icon as any} size={15} color="#374151" />
      </View>
      <Text className="flex-1 text-sm font-medium text-foreground">{label}</Text>
      {value && (
        <Text className="text-sm text-muted-foreground mr-2">{value}</Text>
      )}
      <Feather name="chevron-right" size={16} color="#9ca3af" />
    </Pressable>
  );
}
