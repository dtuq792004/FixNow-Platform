/**
 * Stateless guard screens shown while the request detail is loading or errored.
 */
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const RequestDetailLoadingSkeleton = ({ onBack }: { onBack: () => void }) => {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center border-b border-zinc-100 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={onBack} className="p-2 mr-1">
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View className="h-5 w-48 bg-zinc-100 rounded" />
      </View>
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#18181b" />
        <Text className="text-[13px] text-zinc-400">Đang tải...</Text>
      </View>
    </View>
  );
};

export const RequestDetailErrorState = ({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center border-b border-zinc-100 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={onBack} className="p-2 mr-1">
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <Text className="text-base font-bold text-zinc-900">Chi tiết yêu cầu</Text>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
          <Feather name="alert-circle" size={30} color="#ef4444" />
        </View>
        <Text className="text-[15px] font-bold text-zinc-900 text-center mb-2">
          Không tìm thấy yêu cầu
        </Text>
        <Text className="text-[13px] text-zinc-500 text-center leading-5 mb-6">{message}</Text>
        <View className="flex-row gap-3 w-full">
          <Pressable
            onPress={onBack}
            className="flex-1 h-11 border border-zinc-200 rounded-xl items-center justify-center active:opacity-70"
          >
            <Text className="text-sm font-semibold text-zinc-700">Quay lại</Text>
          </Pressable>
          <Pressable
            onPress={onRetry}
            className="flex-1 h-11 bg-zinc-900 rounded-xl items-center justify-center active:opacity-80"
          >
            <Text className="text-sm font-semibold text-white">Thử lại</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
