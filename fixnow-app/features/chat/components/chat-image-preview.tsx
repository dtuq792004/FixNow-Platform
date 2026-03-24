/**
 * Shows a thumbnail of the image the user has picked but not yet sent,
 * with an upload spinner and a discard button.
 */
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  uri: string;
  isUploading: boolean;
  onDiscard: () => void;
}

export const ChatImagePreview = ({ uri, isUploading, onDiscard }: Props) => (
  <View className="px-4 py-2 bg-background border-t border-border">
    <View className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
      <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
      <View className="absolute inset-0 bg-black/10" />

      {isUploading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      {!isUploading && (
        <Pressable
          className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
          onPress={onDiscard}
        >
          <Feather name="x" size={14} color="white" />
        </Pressable>
      )}
    </View>
  </View>
);
