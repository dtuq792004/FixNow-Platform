import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendAiChat } from '../services/chatbot.service';
import type { AiChatMessage, AiHistoryItem } from '../types/chatbot.types';

const BOT_GREETING =
  'Xin chào! Mình là trợ lý AI của FixNow 👋\nBạn có thể hỏi về dịch vụ sửa chữa, tìm thợ, bảng giá hoặc bất kỳ thắc mắc nào về nền tảng nhé!';

const createMessage = (role: AiChatMessage['role'], content: string): AiChatMessage => ({
  id: `${Date.now()}-${Math.random()}`,
  role,
  content,
  createdAt: new Date().toISOString(),
});

// ── Module-level singleton ────────────────────────────────────────────────────
// Shared across the FAB entry-point and the full-screen /chat/ai route,
// so both views always reflect the same conversation.
let _messages: AiChatMessage[] = [createMessage('assistant', BOT_GREETING)];

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAiChat = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>(_messages);

  /** Update both local state and the module-level store atomically. */
  const syncMessages = useCallback(
    (updater: (prev: AiChatMessage[]) => AiChatMessage[]) => {
      setMessages((prev) => {
        const next = updater(prev);
        _messages = next;
        return next;
      });
    },
    [],
  );

  const mutation = useMutation({
    mutationFn: sendAiChat,
    onSuccess: (reply) => {
      syncMessages((prev) => [...prev, createMessage('assistant', reply)]);
    },
    onError: () => {
      syncMessages((prev) => [
        ...prev,
        createMessage(
          'assistant',
          'Mình gặp lỗi khi xử lý yêu cầu. Bạn thử lại sau ít phút nhé 🙏',
        ),
      ]);
    },
  });

  /** Conversation history sent to Gemini API (excludes the current message being sent). */
  const history = useMemo<AiHistoryItem[]>(() => {
    const res: AiHistoryItem[] = [];
    let firstUserFound = false;
    for (const m of messages) {
      if (m.role === 'user') firstUserFound = true;
      if (firstUserFound) {
        res.push({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] });
      }
    }
    return res;
  }, [messages]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || mutation.isPending) return;
      syncMessages((prev) => [...prev, createMessage('user', trimmed)]);
      mutation.mutate({ message: trimmed, history });
    },
    [mutation, history, syncMessages],
  );

  const clearChat = useCallback(() => {
    const fresh = [createMessage('assistant', BOT_GREETING)];
    _messages = fresh;
    setMessages(fresh);
  }, []);

  return {
    messages,
    sendMessage,
    isSending: mutation.isPending,
    clearChat,
  };
};
