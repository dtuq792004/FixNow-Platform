import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessageApi,
  uploadImageApi,
} from '../services/chat.service';
import type { ChatMessage } from '../types/chat.types';

// ── Conversations ─────────────────────────────────────────────────────────────

export const useConversations = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    staleTime: 30_000, // 30s — socket keeps list fresh
  });

  return { conversations: data ?? [], isLoading, refetch };
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

// ── Messages ──────────────────────────────────────────────────────────────────

export const useMessages = (conversationId: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 60_000,
  });

  return { messages: data ?? [], isLoading };
};

export const useSendMessageMutation = (conversationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessageApi,
    onSuccess: (newMessage) => {
      // Append to message cache (REST fallback path — socket usually handles this)
      if (conversationId) {
        queryClient.setQueryData<ChatMessage[]>(
          ['messages', conversationId],
          (prev = []) =>
            prev.some((m) => m._id === newMessage._id) ? prev : [...prev, newMessage],
        );
      }
      // Refresh conversation list so lastMessage / updatedAt update
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// ── Image upload ──────────────────────────────────────────────────────────────

export const useUploadChatImageMutation = () =>
  useMutation({ mutationFn: uploadImageApi });
