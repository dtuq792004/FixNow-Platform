import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '~/features/auth/stores/auth.store';
import { useConversations } from '~/features/chat/hooks/use-chat';
import { getRelativeTime } from '~/features/home/utils/format-time';
import type { Conversation } from '~/features/chat/types/chat.types';

// ── Skeleton row ──────────────────────────────────────────────────────────────
const ConversationSkeleton = () => (
  <View className="flex-row items-center px-4 py-3.5">
    <View className="w-12 h-12 rounded-full bg-muted mr-3 shrink-0" />
    <View className="flex-1 gap-2">
      <View className="h-[13px] w-[120px] rounded-md bg-muted" />
      <View className="h-3 w-[180px] rounded-md bg-muted" />
    </View>
  </View>
);

// ── Conversation row ──────────────────────────────────────────────────────────
interface RowProps {
  item: Conversation;
  currentUserId: string | undefined;
  onPress: (item: Conversation) => void;
}

const ConversationRow = ({ item, currentUserId, onPress }: RowProps) => {
  const partner =
    item.participants.find((p) => p._id !== currentUserId) ?? item.participants[0];
  const initial = (partner?.fullName?.trim().split(' ').pop()?.[0] ?? '?').toUpperCase();

  const preview =
    item.lastMessage?.type === 'IMAGE'
      ? '[Hình ảnh]'
      : item.lastMessage?.content || 'Chưa có tin nhắn';
  const timeLabel = item.lastMessage?.createdAt
    ? getRelativeTime(item.lastMessage.createdAt)
    : '';

  return (
    <Pressable
      onPress={() => onPress(item)}
      className="flex-row items-center px-4 py-3 bg-background active:bg-muted"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center mr-3 shrink-0">
        <Text className="text-[17px] font-bold text-secondary-foreground">
          {initial}
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-[3px]">
          <Text
            className="flex-1 mr-2 text-sm font-semibold text-foreground"
            numberOfLines={1}
          >
            {partner?.fullName || 'Người dùng'}
          </Text>
          <Text className="text-[11px] text-muted-foreground shrink-0">
            {timeLabel}
          </Text>
        </View>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
          {preview}
        </Text>
      </View>

      <View className="ml-1.5">
        <Feather name="chevron-right" size={15} color="#d4d4d8" />
      </View>
    </Pressable>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ChatListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // only for FlatList contentContainerStyle bottom padding
  const currentUser = useUser();
  const currentUserId = currentUser?._id ?? (currentUser as any)?.id;
  const { conversations, isLoading, refetch } = useConversations();

  const handlePress = (item: Conversation) => {
    const partner =
      item.participants.find((p) => p._id !== currentUserId) ?? item.participants[0];
    router.push(
      `/chat/${item._id}?name=${encodeURIComponent(partner?.fullName ?? 'Người dùng')}` as never,
    );
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="p-1.5 mr-2 -ml-1.5"
          hitSlop={8}
        >
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <Text className="flex-1 text-[17px] font-bold text-foreground">
          Tin nhắn
        </Text>
      </View>

      {isLoading ? (
        <>
          <ConversationSkeleton />
          <ConversationSkeleton />
          <ConversationSkeleton />
        </>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              currentUserId={currentUserId}
              onPress={handlePress}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-border ml-[76px]" />
          )}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor="#18181b" />
          }
          contentContainerStyle={
            conversations.length === 0
              ? { flex: 1 }
              : { paddingBottom: insets.bottom + 16 }
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8">
              <View className="w-[72px] h-[72px] rounded-full bg-muted items-center justify-center mb-3.5">
                <Feather name="message-circle" size={32} color="#a1a1aa" />
              </View>
              <Text className="text-base font-bold text-foreground mb-1.5">
                Chưa có cuộc trò chuyện
              </Text>
              <Text className="text-[13px] text-muted-foreground text-center leading-5">
                Các cuộc trò chuyện với thợ kỹ thuật sẽ xuất hiện ở đây.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
