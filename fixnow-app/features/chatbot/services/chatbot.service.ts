import apiClient from '~/lib/api-client';
import type { AiChatRequest } from '../types/chatbot.types';

interface AiChatApiResponse {
  message: string;
  data: {
    reply: string;
  };
}

export const sendAiChat = async (payload: AiChatRequest): Promise<string> => {
  const { data } = await apiClient.post<AiChatApiResponse>('/ai/chat', payload);
  return data.data.reply;
};
