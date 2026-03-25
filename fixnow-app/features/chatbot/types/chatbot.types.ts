export type AiChatRole = 'user' | 'assistant';

export interface AiChatMessage {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: string;
}

export interface AiHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface AiChatRequest {
  message: string;
  history: AiHistoryItem[];
}
