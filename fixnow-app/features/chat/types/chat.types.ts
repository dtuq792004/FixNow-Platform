export interface ChatParticipant {
  _id: string;
  fullName: string;
  avatar?: string;
  role: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: ChatParticipant; // Trả về dạng populated
  content: string;
  type: 'TEXT' | 'IMAGE';
  seen: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessage?: {
    content: string;
    type: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE';
}
