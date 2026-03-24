/**
 * Socket.IO hook for real-time chat.
 *
 * Design decisions:
 * - Socket connects once per token (not per conversationId) to avoid thrashing.
 * - conversationId is stored in a ref so event handlers always read the latest
 *   value without needing to be recreated.
 * - realtimeMessages resets when conversationId changes so stale messages from
 *   the previous conversation are never shown.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import apiClient from '~/lib/api-client';
import { useAuthStore } from '~/features/auth/stores/auth.store';
import type { ChatMessage, SendMessageDto } from '../types/chat.types';

/**
 * Strip any path suffix from the API base URL to get the Socket.IO server root.
 * e.g. "http://10.0.2.2:5000/api" → "http://10.0.2.2:5000"
 */
const getSocketUrl = (): string => {
  const base = apiClient.defaults.baseURL ?? 'http://localhost:5000';
  try {
    const url = new URL(base);
    return `${url.protocol}//${url.host}`;
  } catch {
    return base.replace(/\/api.*$/, '');
  }
};

export const useChatSocket = (conversationId: string | undefined) => {
  const token = useAuthStore((s) => s.session?.access_token);

  const socketRef = useRef<Socket | null>(null);
  const conversationIdRef = useRef(conversationId);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);

  // Keep ref in sync so event handlers always read the latest conversationId
  useEffect(() => {
    conversationIdRef.current = conversationId;
    // Reset real-time buffer whenever the conversation changes
    setRealtimeMessages([]);
  }, [conversationId]);

  // Connect once per token — not per conversationId
  useEffect(() => {
    if (!token) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
    });

    const handleMessage = (msg: ChatMessage) => {
      if (msg.conversationId !== conversationIdRef.current) return;
      setRealtimeMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on('new_message', handleMessage);
    socket.on('message_sent', handleMessage);

    socketRef.current = socket;

    return () => {
      socket.off('new_message', handleMessage);
      socket.off('message_sent', handleMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const sendRealtimeMessage = useCallback((payload: SendMessageDto) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('send_message', payload);
      return true;
    }
    return false; // caller should fall back to REST
  }, []);

  const isConnected = useCallback(
    () => socketRef.current?.connected ?? false,
    [],
  );

  return { realtimeMessages, sendRealtimeMessage, isConnected };
};
