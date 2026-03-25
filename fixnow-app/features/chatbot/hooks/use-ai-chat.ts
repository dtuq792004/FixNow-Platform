import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendAiChat } from '../services/chatbot.service';
import type { AiChatMessage, AiHistoryItem } from '../types/chatbot.types';

const BOT_GREETING =
  'Xin chào! Mình là trợ lý AI của FixNow. Bạn cần tư vấn sửa chữa hoặc giải đáp về dịch vụ nào?';

const createMessage = (role: AiChatMessage['role'], content: string): AiChatMessage => ({
  id: `${Date.now()}-${Math.random()}`,
  role,
  content,
  createdAt: new Date().toISOString(),
});

export const useAiChat = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    createMessage('assistant', BOT_GREETING),
  ]);

  const mutation = useMutation({
    mutationFn: sendAiChat,
    onSuccess: (reply) => {
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        createMessage(
          'assistant',
          'Mình đang gặp lỗi khi xử lý yêu cầu. Bạn thử lại sau ít phút nhé.',
        ),
      ]);
    },
  });

  const history = useMemo<AiHistoryItem[]>(() => {
    const res: AiHistoryItem[] = [];
    let firstUserFound = false;

    for (const m of messages) {
      if (m.role === 'user') firstUserFound = true;
      if (firstUserFound) {
        res.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        });
      }
    }
    return res;
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    setMessages((prev) => [...prev, createMessage('user', trimmed)]);
    mutation.mutate({ message: trimmed, history });
  };

  return {
    messages,
    sendMessage,
    isSending: mutation.isPending,
  };
};
