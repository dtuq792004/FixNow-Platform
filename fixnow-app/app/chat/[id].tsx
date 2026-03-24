import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Keyboard,
  KeyboardAvoidingView, Platform, Pressable,
  Text, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '~/features/auth/stores/auth.store';
import { useMessages } from '~/features/chat/hooks/use-chat';
import { useChatSocket } from '~/features/chat/hooks/use-chat-socket';
import { useChatSend } from '~/features/chat/hooks/use-chat-send';
import { ChatMessageBubble } from '~/features/chat/components/chat-message-bubble';
import { ChatImagePreview } from '~/features/chat/components/chat-image-preview';
import { ChatInputBar } from '~/features/chat/components/chat-input-bar';
import type { ChatMessage } from '~/features/chat/types/chat.types';

export default function ChatDetailScreen() {
  const { id: conversationId, name: partnerName } =
    useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();

  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?._id ?? (session?.user as any)?.id;

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { messages: historicalMessages, isLoading } = useMessages(conversationId as string);
  const { realtimeMessages, sendRealtimeMessage, isConnected } = useChatSocket(
    conversationId as string,
  );
  const {
    inputText, setInputText,
    pendingImage, setPendingImage,
    handlePickImage, handleSend, isSending,
  } = useChatSend(conversationId as string, sendRealtimeMessage);

  // Merge historical REST messages with socket messages, sorted asc
  const allMessages = useMemo<ChatMessage[]>(() => {
    const merged = [...historicalMessages];
    for (const rt of realtimeMessages) {
      if (!merged.some((h) => h._id === rt._id)) merged.push(rt);
    }
    return merged.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [historicalMessages, realtimeMessages]);

  // Android keyboard workaround
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const displayName = partnerName ? decodeURIComponent(partnerName) : 'Trò chuyện';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-safe pb-3 bg-background border-b border-border">
          <Pressable onPress={() => router.back()} className="mr-3 p-2 -ml-2" hitSlop={8}>
            <Feather name="arrow-left" size={22} color="#18181b" />
          </Pressable>
          <Text className="flex-1 text-base font-bold text-foreground" numberOfLines={1}>
            {displayName}
          </Text>
          {!isConnected() && (
            <View className="flex-row items-center gap-1 px-2 py-1 bg-amber-50 rounded-full border border-amber-200">
              <Feather name="wifi-off" size={11} color="#d97706" />
              <Text className="text-[10px] text-amber-600 font-semibold">Offline</Text>
            </View>
          )}
        </View>

        {/* Message list */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#18181b" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...allMessages].reverse()}
            inverted
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ChatMessageBubble item={item} currentUserId={currentUserId} />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10 scale-y-[-1]">
                <Text className="text-muted-foreground text-sm">
                  Hãy bắt đầu cuộc trò chuyện!
                </Text>
              </View>
            }
          />
        )}

        {/* Pending image preview */}
        {pendingImage && (
          <ChatImagePreview
            uri={pendingImage}
            isUploading={isSending}
            onDiscard={() => setPendingImage(null)}
          />
        )}

        {/* Input */}
        <ChatInputBar
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
          onPickImage={handlePickImage}
          onDiscardImage={() => setPendingImage(null)}
          hasPendingImage={!!pendingImage}
          isSending={isSending}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
