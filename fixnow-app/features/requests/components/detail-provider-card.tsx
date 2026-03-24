import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, Text as RNText, View } from 'react-native';
import { useCreateConversationMutation } from '~/features/chat/hooks/use-chat';
import type { ServiceRequestDetail } from '~/features/requests/types';

interface DetailProviderCardProps {
  provider: NonNullable<ServiceRequestDetail['provider']>;
}

/** Card showing assigned provider info with chat + phone shortcuts */
export const DetailProviderCard = ({ provider }: DetailProviderCardProps) => {
  const router = useRouter();
  const createConversation = useCreateConversationMutation();

  const handleChat = (e: any) => {
    e.stopPropagation?.();
    createConversation.mutate(provider.id, {
      onSuccess: (conversation) => {
        router.push(
          `/chat/${conversation._id}?name=${encodeURIComponent(provider.name)}` as never,
        );
      },
      onError: () => {
        Alert.alert('Lỗi', 'Không thể mở cuộc trò chuyện. Vui lòng thử lại.');
      },
    });
  };

  return (
    <Pressable
      onPress={() => router.push(`/providers/${provider.id}` as never)}
      className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`Xem hồ sơ ${provider.name}`}
    >
      {/* Avatar initial */}
      <View className="w-11 h-11 rounded-full bg-zinc-900 items-center justify-center mr-3 shrink-0">
        <RNText className="text-white font-bold text-base">
          {provider.name.charAt(0)}
        </RNText>
      </View>

      {/* Info */}
      <View className="flex-1">
        <RNText className="text-[15px] font-bold text-zinc-900">{provider.name}</RNText>
        {provider.rating && (
          <View className="flex-row items-center mt-0.5">
            <Feather name="star" size={11} color="#F59E0B" />
            <RNText className="text-xs text-zinc-500 ml-1">
              {provider.rating.toFixed(1)}
            </RNText>
          </View>
        )}
        <RNText className="text-[11px] text-zinc-400 mt-0.5">Nhấn để xem hồ sơ</RNText>
      </View>

      {/* Chat button */}
      <Pressable
        onPress={handleChat}
        disabled={createConversation.isPending}
        className="w-9 h-9 rounded-[10px] bg-blue-50 border border-blue-200 items-center justify-center ml-2 shrink-0"
        accessibilityLabel={`Nhắn tin với ${provider.name}`}
      >
        {createConversation.isPending ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <Feather name="message-circle" size={15} color="#2563eb" />
        )}
      </Pressable>

      {/* Phone button */}
      {provider.phone && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            // Linking.openURL(`tel:${provider.phone}`);
          }}
          className="w-9 h-9 rounded-[10px] bg-green-50 border border-green-200 items-center justify-center ml-2 shrink-0"
          accessibilityLabel={`Gọi cho ${provider.name}`}
        >
          <Feather name="phone" size={15} color="#16a34a" />
        </Pressable>
      )}

      <View className="ml-1">
        <Feather name="chevron-right" size={16} color="#d4d4d8" />
      </View>
    </Pressable>
  );
};
