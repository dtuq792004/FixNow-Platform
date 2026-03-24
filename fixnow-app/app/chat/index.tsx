import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Card, CardContent } from '~/components/ui/card';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useConversations } from '~/features/chat/hooks/use-chat';
import { useUser } from '~/features/auth/stores/auth.store';

export default function ChatListScreen() {
  const router = useRouter();
  const { conversations, isLoading } = useConversations();
  const currentUser = useUser();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pt-safe pb-4 bg-background border-b border-border">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#374151" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Tin nhắn</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center mt-20">
            <Feather name="message-square" size={64} color="#d1d5db" />
            <Text className="text-muted-foreground mt-4">Chưa có cuộc trò chuyện nào</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const currentUserId = currentUser?._id || (currentUser as any)?.id;
          const partner = item.participants.find(p => p._id !== currentUserId) || item.participants[0];

          return (
            <Pressable onPress={() => router.push(`/chat/${item._id}`)} className="mb-3">
              <Card className="rounded-2xl border-border bg-card">
                <CardContent className="flex-row items-center p-4">
                  <Avatar className="h-12 w-12 mr-3" alt={partner?.fullName || "User"}>
                    <AvatarImage source={{ uri: partner?.avatar }} />
                    <AvatarFallback>
                      <Text className="text-secondary-foreground">
                        {partner?.fullName?.slice(0, 2).toUpperCase() || 'U'}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {partner?.fullName || 'Người dùng'}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {item.lastMessage?.createdAt
                          ? formatDistanceToNow(new Date(item.lastMessage.createdAt), { addSuffix: true, locale: vi })
                          : ''}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                      {item.lastMessage?.type === 'IMAGE'
                        ? '[Hình ảnh]'
                        : item.lastMessage?.content || 'Chưa có tin nhắn'}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
