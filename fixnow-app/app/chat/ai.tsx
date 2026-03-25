import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { AiSuggestionChips } from '~/features/chatbot/components/ai-suggestion-chips';
import { MessageBubble } from '~/features/chatbot/components/message-bubble';
import { TypingIndicator } from '~/features/chatbot/components/typing-indicator';
import { useAiChat } from '~/features/chatbot/hooks/use-ai-chat';

export default function AiChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const { messages, sendMessage, isSending, clearChat } = useAiChat();
  const listRef = useRef<FlatList>(null);

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const showSuggestions = messages.length === 1; // only greeting visible
  const canSend = input.trim().length > 0 && !isSending;

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    sendMessage(text);
  }, [input, isSending, sendMessage]);

  const handleSuggestion = useCallback(
    (text: string) => {
      if (!isSending) sendMessage(text);
    },
    [isSending, sendMessage],
  );

  const handleClear = () => {
    Alert.alert('Xoá cuộc trò chuyện', 'Bắt đầu cuộc trò chuyện mới?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: clearChat },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View
          style={{ paddingTop: insets.top + 8 }}
          className="flex-row items-center px-4 pb-3 border-b border-zinc-100 bg-white"
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="w-9 h-9 items-center justify-center rounded-full mr-1"
          >
            <Feather name="chevron-left" size={24} color="#18181b" />
          </Pressable>

          <View className="w-9 h-9 rounded-full bg-zinc-900 items-center justify-center mr-3">
            <Feather name="cpu" size={16} color="#fff" />
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-zinc-900 leading-tight">FixNow AI</Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-xs text-zinc-400">Trợ lý đang hoạt động</Text>
            </View>
          </View>

          <Pressable
            onPress={handleClear}
            hitSlop={8}
            className="w-9 h-9 items-center justify-center rounded-full"
            accessibilityLabel="Xoá cuộc trò chuyện"
          >
            <Feather name="refresh-ccw" size={18} color="#71717a" />
          </Pressable>
        </View>

        {/* ── Messages ───────────────────────────────────────────────────── */}
        <FlatList
          ref={listRef}
          data={reversedMessages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble role={item.role} content={item.content} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // In an inverted list, ListHeaderComponent appears at the visual bottom
          ListHeaderComponent={isSending ? <TypingIndicator /> : null}
          // ListFooterComponent appears at the visual top (shown above the greeting)
          ListFooterComponent={
            showSuggestions ? (
              <AiSuggestionChips onSelect={handleSuggestion} disabled={isSending} />
            ) : null
          }
        />

        {/* ── Input bar ──────────────────────────────────────────────────── */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 8) + 8 }}
          className="bg-white border-t border-zinc-100 px-4 pt-3"
        >
          <View className="flex-row items-end gap-2">
            <View className="flex-1 bg-zinc-100 rounded-2xl px-4 py-2.5 min-h-[44px] justify-center">
              <TextInput
                className="text-sm text-zinc-900 max-h-28"
                placeholder="Nhập câu hỏi cho AI..."
                placeholderTextColor="#a1a1aa"
                value={input}
                onChangeText={setInput}
                multiline
                editable={!isSending}
                blurOnSubmit={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
            </View>

            {/* Send — always visible; dims when empty/busy */}
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                canSend ? 'bg-zinc-900' : 'bg-zinc-200'
              }`}
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
            >
              <Feather
                name="send"
                size={16}
                color={canSend ? '#fff' : '#a1a1aa'}
                style={{ marginLeft: 1 }}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
