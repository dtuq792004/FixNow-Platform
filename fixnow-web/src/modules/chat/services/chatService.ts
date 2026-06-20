import { authenticatedRequest } from '../../auth/services/authService'

export type ChatUser = { _id: string; fullName: string; avatar?: string; role: string }
export type ChatMessage = {
  _id: string
  content: string
  type: 'TEXT' | 'IMAGE'
  sender: ChatUser | string
  createdAt: string
}
export type Conversation = {
  _id: string
  participants: ChatUser[]
  lastMessage?: ChatMessage
  updatedAt: string
}

export const chatService = {
  getConversations: () => authenticatedRequest<Conversation[]>('/chat/conversations'),
  createConversation: (participantId: string) =>
    authenticatedRequest<Conversation>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    }),
  getMessages: (conversationId: string) =>
    authenticatedRequest<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`),
}
