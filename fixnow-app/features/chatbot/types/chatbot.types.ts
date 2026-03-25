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
  /** Base64-encoded image (optional) — backend ai.service supports vision */
  imageBase64?: string;
  /** MIME type of the image, e.g. "image/jpeg" */
  mimeType?: string;
}
