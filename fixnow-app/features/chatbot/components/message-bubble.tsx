import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

/** Single chat bubble for either the user or the AI assistant. */
export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const isBot = role === 'assistant';
  return (
    <View className={`mb-3 flex-row items-end ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <View className="w-7 h-7 rounded-full bg-zinc-900 items-center justify-center mr-2 mb-0.5 shrink-0">
          <Feather name="cpu" size={13} color="#fff" />
        </View>
      )}
      <View
        className={`max-w-[78%] px-4 py-2.5 ${
          isBot ? 'bg-zinc-100 rounded-2xl rounded-bl-sm' : 'bg-zinc-900 rounded-2xl rounded-br-sm'
        }`}
      >
        <Text className={`text-sm leading-[22px] ${isBot ? 'text-zinc-800' : 'text-white'}`}>
          {content}
        </Text>
      </View>
    </View>
  );
};
