/**
 * Encapsulates all send-related state and logic for the chat detail screen:
 * - text input state
 * - pending image state
 * - image picking via expo-image-picker
 * - send via socket (with REST fallback)
 * - conversations list invalidation after send
 */
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useSendMessageMutation, useUploadChatImageMutation } from './use-chat';
import type { SendMessageDto } from '../types/chat.types';

type SendViaSocket = (payload: SendMessageDto) => boolean;

export const useChatSend = (conversationId: string, sendRealtimeMessage: SendViaSocket) => {
  const queryClient = useQueryClient();
  const uploadImageMutation = useUploadChatImageMutation();
  const sendMessageMutation = useSendMessageMutation(conversationId);

  const [inputText, setInputText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const invalidateConversations = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [queryClient]);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPendingImage(result.assets[0].uri);
    }
  }, []);

  const handleSend = useCallback(() => {
    if (pendingImage) {
      if (uploadImageMutation.isPending) return;
      uploadImageMutation.mutate(pendingImage, {
        onSuccess: (imageUrl) => {
          const payload: SendMessageDto = {
            conversationId,
            content: imageUrl,
            type: 'IMAGE',
          };
          const sent = sendRealtimeMessage(payload);
          if (!sent) sendMessageMutation.mutate(payload);
          setPendingImage(null);
          invalidateConversations();
        },
      });
      return;
    }

    const text = inputText.trim();
    if (!text) return;

    const payload: SendMessageDto = { conversationId, content: text, type: 'TEXT' };
    setInputText('');

    const sent = sendRealtimeMessage(payload);
    if (!sent) {
      sendMessageMutation.mutate(payload); // REST fallback (already invalidates via onSuccess)
    } else {
      invalidateConversations();
    }
  }, [
    pendingImage,
    inputText,
    conversationId,
    sendRealtimeMessage,
    uploadImageMutation,
    sendMessageMutation,
    invalidateConversations,
  ]);

  const isSending = uploadImageMutation.isPending || sendMessageMutation.isPending;

  return {
    inputText,
    setInputText,
    pendingImage,
    setPendingImage,
    handlePickImage,
    handleSend,
    isSending,
  };
};
