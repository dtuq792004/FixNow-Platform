import apiClient from '~/lib/api-client';
import type { AiChatRequest } from '../types/chatbot.types';

interface AiChatApiResponse {
  message: string;
  data: {
    reply: string;
  };
}

// Gemini with function-calling can take 20-30 s — override the global 10 s default.
const AI_TIMEOUT_MS = 30_000;

export const sendAiChat = async (payload: AiChatRequest): Promise<string> => {
  const { data } = await apiClient.post<AiChatApiResponse>('/ai/chat', payload, {
    timeout: AI_TIMEOUT_MS,
  });
  return data.data.reply;
};
