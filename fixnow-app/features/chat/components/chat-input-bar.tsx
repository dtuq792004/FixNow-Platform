/**
 * Bottom input bar: image picker toggle, text field, and send button.
 */
import { Feather } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  onPickImage: () => void;
  onDiscardImage: () => void;
  hasPendingImage: boolean;
  isSending: boolean;
}

export const ChatInputBar = ({
  value,
  onChange,
  onSend,
  onPickImage,
  onDiscardImage,
  hasPendingImage,
  isSending,
}: Props) => {
  const canSend = !!value.trim() || hasPendingImage;

  return (
    <View className="flex-row items-end px-4 py-3 bg-background border-t border-border pb-safe gap-2">
      {/* Image picker / discard button */}
      <Pressable
        className="w-9 h-9 rounded-full bg-secondary items-center justify-center flex-shrink-0"
        onPress={hasPendingImage ? onDiscardImage : onPickImage}
        disabled={isSending}
      >
        <Feather
          name={hasPendingImage ? 'x' : 'image'}
          size={18}
          color={hasPendingImage ? '#ef4444' : '#52525b'}
        />
      </Pressable>

      {/* Text field */}
      <View className="flex-1 flex-row items-center bg-secondary rounded-2xl px-4 py-2 min-h-[40px]">
        <TextInput
          className="flex-1 text-sm text-foreground max-h-32"
          placeholder={hasPendingImage ? 'Thêm chú thích...' : 'Nhập tin nhắn...'}
          placeholderTextColor="#a1a1aa"
          value={value}
          onChangeText={onChange}
          editable={!(hasPendingImage && isSending)}
          multiline
          onSubmitEditing={onSend}
        />
      </View>

      {/* Send button — visible only when there's something to send */}
      {canSend && (
        <Pressable
          className="w-9 h-9 rounded-full bg-primary items-center justify-center flex-shrink-0"
          onPress={onSend}
          disabled={isSending}
        >
          <Feather name="send" size={16} color="white" style={{ marginLeft: 1 }} />
        </Pressable>
      )}
    </View>
  );
};
