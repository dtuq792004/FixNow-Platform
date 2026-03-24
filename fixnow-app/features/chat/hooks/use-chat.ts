import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages, createConversation, sendMessageApi, uploadImageApi } from '../services/chat.service';

// --- Danh sách cuộc hội thoại ---
export const useConversations = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });

  return {
    conversations: data || [],
    isLoading,
    refetch,
  };
};

export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// --- Chi tiết cuộc hội thoại ---
export const useMessages = (conversationId: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
  });

  return {
    messages: data || [],
    isLoading,
  };
};

export const useSendMessageMutation = () => {
  return useMutation({
    mutationFn: sendMessageApi,
    // Typically, you might want to optimistically update or invalidate queries here,
    // but with socket.io handles the real-time update in this architecture.
  });
};

export const useUploadChatImageMutation = () => {
  return useMutation({
    mutationFn: uploadImageApi,
  });
};
