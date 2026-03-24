import apiClient from '~/lib/api-client';
import type { Conversation, ChatMessage, SendMessageDto } from '../types/chat.types';

export const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await apiClient.get<Conversation[]>('/chat/conversations');
  return data;
};

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const { data } = await apiClient.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
  return data;
};

export const createConversation = async (participantId: string): Promise<Conversation> => {
  const { data } = await apiClient.post<Conversation>('/chat/conversations', { participantId });
  return data;
};

export const sendMessageApi = async (payload: SendMessageDto): Promise<ChatMessage> => {
  const { data } = await apiClient.post<ChatMessage>('/chat/messages', payload);
  return data;
};

export const uploadImageApi = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  const { data } = await apiClient.post<{ imageUrl: string }>('/chat/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.imageUrl;
};
