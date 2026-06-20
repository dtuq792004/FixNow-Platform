import type { Socket } from 'socket.io-client'
import { getAuthenticatedSocket } from '../../../shared/services/socketClient'
import type { ChatMessage } from './chatService'

type SendMessageResponse = {
  ok: boolean
  message?: ChatMessage
  error?: string
}

export const chatSocketService = {
  connect(accessToken: string) {
    return getAuthenticatedSocket(accessToken)
  },

  sendMessage(
    socket: Socket,
    payload: { conversationId: string; content: string; type?: 'TEXT' | 'IMAGE' },
  ) {
    return new Promise<ChatMessage>((resolve, reject) => {
      socket.timeout(10_000).emit(
        'send_message',
        payload,
        (timeoutError: Error | null, response?: SendMessageResponse) => {
          if (timeoutError) {
            reject(new Error('Kết nối chat quá thời gian. Vui lòng thử lại.'))
            return
          }

          if (!response?.ok || !response.message) {
            reject(new Error(response?.error || 'Không thể gửi tin nhắn.'))
            return
          }

          resolve(response.message)
        },
      )
    })
  },
}
