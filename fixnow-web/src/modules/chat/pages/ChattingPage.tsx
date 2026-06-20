import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Search, Send } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState } from '../../../shared/components/PageStates'
import { cn } from '../../../shared/utils/cn'
import { useAuthStore } from '../../auth/store/authStore'
import { useRealtimeChat } from '../hooks/useRealtimeChat'
import { chatService, type Conversation } from '../services/chatService'
import { chatSocketService } from '../services/chatSocketService'

export function ChattingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)
  const socket = useRealtimeChat()
  const [activeId, setActiveId] = useState('')
  const [message, setMessage] = useState('')
  const conversationsQuery = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: chatService.getConversations,
  })
  const requestedId = searchParams.get('conversation') || ''
  const requestedConversationExists = conversationsQuery.data?.some(
    (item) => item._id === requestedId,
  )
  const selectedId =
    activeId ||
    (requestedConversationExists ? requestedId : '') ||
    conversationsQuery.data?.[0]?._id ||
    ''
  const messagesQuery = useQuery({
    queryKey: ['chat', selectedId, 'messages'],
    queryFn: () => chatService.getMessages(selectedId),
    enabled: Boolean(selectedId),
  })
  const sendMutation = useMutation({
    mutationFn: () => {
      if (!socket) throw new Error('Chưa kết nối được máy chủ chat.')
      return chatSocketService.sendMessage(socket, {
        conversationId: selectedId,
        content: message.trim(),
        type: 'TEXT',
      })
    },
    onSuccess: () => {
      setMessage('')
    },
  })

  const getOtherParticipant = (conversation: Conversation) =>
    conversation.participants.find(
      (participant) => participant._id !== (currentUser?.id || currentUser?._id),
    ) ?? conversation.participants[0]
  const activeConversation = conversationsQuery.data?.find(
    (item) => item._id === selectedId,
  )
  const activeUser = activeConversation
    ? getOtherParticipant(activeConversation)
    : undefined
  const currentUserId = currentUser?.id || currentUser?._id

  const selectConversation = (conversationId: string) => {
    setActiveId(conversationId)
    setSearchParams({ conversation: conversationId })
  }

  const closeConversation = () => {
    setActiveId('')
    setSearchParams({})
  }

  const send = () => {
    if (!message.trim() || !selectedId || !socket || sendMutation.isPending) return
    sendMutation.mutate()
  }

  if (conversationsQuery.isError) {
    return (
      <div className="p-6">
        <ErrorState message={conversationsQuery.error.message} />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px)] max-w-7xl gap-4 md:px-6 md:py-5">
      <aside
        className={cn(
          'w-full overflow-y-auto border-r border-slate-200 bg-white md:block md:w-80 md:rounded-2xl md:border',
          selectedId && 'hidden',
        )}
      >
        <div className="p-5">
          <h1 className="text-2xl font-bold">Tin nhắn</h1>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3">
            <Search size={18} className="text-slate-400" />
            <input
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Tìm cuộc trò chuyện..."
            />
          </div>
        </div>
        {!conversationsQuery.isPending && !conversationsQuery.data?.length && (
          <div className="p-4">
            <EmptyState message="Chưa có cuộc trò chuyện." />
          </div>
        )}
        <div>
          {conversationsQuery.data?.map((conversation) => {
            const participant = getOtherParticipant(conversation)
            return (
              <button
                key={conversation._id}
                onClick={() => selectConversation(conversation._id)}
                className={cn(
                  'flex w-full gap-3 border-t border-slate-100 p-4 text-left hover:bg-slate-50',
                  selectedId === conversation._id && 'bg-blue-50',
                )}
              >
                {participant.avatar ? (
                  <img
                    src={participant.avatar}
                    alt={participant.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100" />
                )}
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{participant.fullName}</b>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {conversation.lastMessage?.content || 'Bắt đầu trò chuyện'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      <section
        className={cn(
          'min-w-0 flex-1 flex-col overflow-hidden border-slate-200 bg-white md:flex md:rounded-2xl md:border',
          selectedId ? 'flex' : 'hidden',
        )}
      >
        {activeUser ? (
          <>
            <header className="flex h-18 shrink-0 items-center gap-3 border-b px-4 sm:px-5">
              <button
                type="button"
                onClick={closeConversation}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Quay lại danh sách"
              >
                <ArrowLeft size={20} />
              </button>
              {activeUser.avatar ? (
                <img
                  src={activeUser.avatar}
                  alt={activeUser.fullName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-blue-100" />
              )}
              <h2 className="truncate font-bold">{activeUser.fullName}</h2>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-5">
              {messagesQuery.data?.map((item) => {
                const senderId =
                  typeof item.sender === 'string' ? item.sender : item.sender._id
                const mine = senderId === currentUserId
                return (
                  <div
                    key={item._id}
                    className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[72%]',
                        mine
                          ? 'rounded-br-md bg-blue-600 text-white'
                          : 'rounded-bl-md bg-white text-slate-700',
                      )}
                    >
                      {item.type === 'IMAGE' ? (
                        <img
                          src={item.content}
                          alt="Ảnh trò chuyện"
                          className="max-w-full rounded-lg sm:max-w-xs"
                        />
                      ) : (
                        item.content
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="shrink-0 border-t bg-white p-3 sm:p-4">
              {sendMutation.isError && (
                <p className="mb-2 text-sm text-red-600">{sendMutation.error.message}</p>
              )}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && send()}
                  className="min-w-0 flex-1 bg-transparent px-2 text-base outline-none"
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  onClick={send}
                  disabled={sendMutation.isPending || !message.trim() || !socket}
                  className="rounded-xl bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
                  aria-label="Gửi tin nhắn"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="m-auto text-slate-500">Chọn một cuộc trò chuyện</div>
        )}
      </section>
    </div>
  )
}
