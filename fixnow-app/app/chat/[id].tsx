import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Modal, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '~/features/auth/stores/auth.store';
import { useMessages, useUploadChatImageMutation } from '~/features/chat/hooks/use-chat';
import { useChatSocket } from '~/features/chat/hooks/use-chat-socket';
import type { ChatMessage } from '~/features/chat/types/chat.types';

export default function ChatDetailScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?._id || (session?.user as any)?.id;

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Queries & Hooks
  const { messages: historicalMessages, isLoading } = useMessages(conversationId as string);
  const uploadImageMutation = useUploadChatImageMutation();
  const { sendRealtimeMessage, mergeMessages } = useChatSocket(conversationId as string);

  // Combine historical REST messages with realtime Socket messages
  const allMessages = mergeMessages(historicalMessages);

  // Android Keyboard Bug Fix (Stuck Padding layout workaround)
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSendAction = () => {
    if (pendingImage) {
      if (!uploadImageMutation.isPending) {
        uploadImageMutation.mutate(pendingImage, {
          onSuccess: (imageUrl) => {
            sendRealtimeMessage({
              conversationId: conversationId as string,
              content: imageUrl,
              type: 'IMAGE'
            });
            setPendingImage(null);
          }
        });
      }
    } else if (inputText.trim()) {
      sendRealtimeMessage({
        conversationId: conversationId as string,
        content: inputText.trim(),
        type: 'TEXT'
      });
      setInputText('');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPendingImage(result.assets[0].uri);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const senderId = typeof item.sender === 'string' ? item.sender : item.sender?._id;
    const isMine = senderId === currentUserId;

    return (
      <View className={`flex-row mb-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <View className="w-8 h-8 rounded-full bg-secondary mr-2 items-center justify-center overflow-hidden">
            {item.sender.avatar ? (
              <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-secondary-foreground text-xs">{item.sender.fullName?.slice(0, 2).toUpperCase()}</Text>
            )}
          </View>
        )}

        <View className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? 'bg-primary rounded-tr-none' : 'bg-secondary rounded-tl-none'}`}>
          {item.type === 'IMAGE' ? (
            <Pressable onPress={() => setSelectedImage(item.content)}>
              <Image
                source={{ uri: item.content }}
                className="w-48 h-48 rounded-lg"
                resizeMode="cover"
              />
            </Pressable>
          ) : (
            <Text className={`text-base ${isMine ? 'text-primary-foreground' : 'text-foreground'}`}>
              {item.content}
            </Text>
          )}
          <Text className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
            {format(new Date(item.createdAt), 'HH:mm')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center px-4 pt-safe pb-4 bg-background border-b border-border">
          <Pressable onPress={() => router.back()} className="mr-4 p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="#374151" />
          </Pressable>
          <Text className="text-lg font-bold text-foreground">Trò chuyện</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...allMessages].reverse()}
            inverted
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10 scale-y-[-1]">
                <Text className="text-muted-foreground">Chưa có tin nhắn ở đây.</Text>
              </View>
            }
          />
        )}

        {/* Pending Image Preview */}
        {pendingImage && (
          <View className="px-4 py-2 bg-background border-t border-border">
            <View className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
              <Image source={{ uri: pendingImage }} className="w-full h-full" resizeMode="cover" />
              <View className="absolute inset-0 bg-black/20" />

              {uploadImageMutation.isPending && (
                <View className="absolute inset-0 items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}

              {!uploadImageMutation.isPending && (
                <Pressable
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                  onPress={() => setPendingImage(null)}
                >
                  <Feather name="x" size={16} color="white" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Input Area */}
        <View className="flex-row items-center px-4 py-3 bg-background border-t border-border pb-safe">
          <Pressable
            className={`p-2 mr-2 rounded-full ${pendingImage ? 'bg-primary/20' : 'bg-secondary'}`}
            onPress={pendingImage ? () => setPendingImage(null) : handlePickImage}
            disabled={uploadImageMutation.isPending}
          >
            <Feather name={pendingImage ? "x" : "image"} size={22} color={pendingImage ? "#FF6B00" : "#374151"} />
          </Pressable>

          <View className="flex-1 flex-row items-center bg-secondary rounded-full px-4 py-2">
            <TextInput
              className="flex-1 text-base text-foreground min-h-[40px] max-h-32"
              placeholder={pendingImage ? "Thêm tin nhắn ảnh..." : "Nhập tin nhắn..."}
              value={inputText}
              onChangeText={setInputText}
              editable={!pendingImage && !uploadImageMutation.isPending}
              multiline
            />
          </View>

          {(inputText.trim() || pendingImage) ? (
            <Pressable
              className="p-3 ml-2 bg-primary rounded-full items-center justify-center"
              onPress={handleSendAction}
              disabled={uploadImageMutation.isPending}
            >
              <Feather name="send" size={20} color="white" className="ml-1" />
            </Pressable>
          ) : null}
        </View>

        {/* Image Full-screen Modal */}
        <Modal visible={!!selectedImage} transparent={true} animationType="fade">
          <View className="flex-1 bg-black/90 justify-center items-center">
            <Pressable
              className="absolute top-12 right-6 z-50 p-2 bg-black/50 rounded-full"
              onPress={() => setSelectedImage(null)}
            >
              <Feather name="x" size={28} color="white" />
            </Pressable>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}
