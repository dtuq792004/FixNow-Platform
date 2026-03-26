import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';

const SUGGESTIONS = [
  '🔧 Tìm thợ sửa điện',
  '🪠 Thợ sửa ống nước',
  '❄️ Giá sửa điều hòa',
  '⭐ Thợ được đánh giá cao nhất',
];

interface AiSuggestionChipsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

/**
 * Quick-question chips displayed below the greeting message.
 * Disappears once the user sends their first message.
 */
export const AiSuggestionChips = ({ onSelect, disabled }: AiSuggestionChipsProps) => (
  <View className="mt-3 gap-2">
    <Text className="text-xs text-zinc-400 mb-0.5">Gợi ý câu hỏi:</Text>
    {SUGGESTIONS.map((s) => (
      <Pressable
        key={s}
        onPress={() => onSelect(s)}
        disabled={disabled}
        className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 active:bg-zinc-100"
      >
        <Text className="text-sm text-zinc-700">{s}</Text>
      </Pressable>
    ))}
  </View>
);
