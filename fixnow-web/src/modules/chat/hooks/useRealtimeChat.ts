import { useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../auth/store/authStore'
import type { ChatMessage } from '../services/chatService'
import { chatSocketService } from '../services/chatSocketService'

type RealtimeChatMessage = ChatMessage & { conversationId: string }

function appendMessage(messages: ChatMessage[] | undefined, message: ChatMessage) {
  if (messages?.some((item) => item._id === message._id)) return messages
  return [...(messages ?? []), message]
}

export function useRealtimeChat() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const socket = useMemo(
    () => (accessToken ? chatSocketService.connect(accessToken) : null),
    [accessToken],
  )

  useEffect(() => {
    if (!socket) return

    const receiveMessage = (message: RealtimeChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ['chat', message.conversationId, 'messages'],
        (messages) => appendMessage(messages, message),
      )
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    }

    socket.on('message_sent', receiveMessage)
    socket.on('chat:new_message', receiveMessage)

    return () => {
      socket.off('message_sent', receiveMessage)
      socket.off('chat:new_message', receiveMessage)
    }
  }, [queryClient, socket])

  return socket
}
