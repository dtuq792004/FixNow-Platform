import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import apiClient from '~/lib/api-client';
import { useAuthStore } from '~/features/auth/stores/auth.store';
import type { ChatMessage, SendMessageDto } from '../types/chat.types';

const getSocketUrl = () => {
  const apiClientBase = apiClient.defaults.baseURL;
  return apiClientBase || 'http://localhost:5000';
};

export const useChatSocket = (conversationId: string | undefined) => {
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?._id || (session?.user as any)?.id;
  const token = session?.access_token;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!token || !conversationId) return;

    const newSocket = io(getSocketUrl(), {
      auth: { token },
    });

    newSocket.on('connect', () => {
      if (currentUserId) newSocket.emit('join', currentUserId);
    });

    const handleIncomingMessage = (msg: ChatMessage) => {
      if (msg.conversationId === conversationId) {
        setRealtimeMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    newSocket.on('new_message', handleIncomingMessage);
    newSocket.on('message_sent', handleIncomingMessage);

    setSocket(newSocket);

    return () => {
      newSocket.off('new_message');
      newSocket.off('message_sent');
      newSocket.disconnect();
    };
  }, [token, currentUserId, conversationId]);

  const sendRealtimeMessage = useCallback(
    (payload: SendMessageDto) => {
      if (!socket || !socket.connected) return;
      socket.emit('send_message', payload);
    },
    [socket]
  );

  return {
    socket,
    realtimeMessages,
    sendRealtimeMessage,
    // Provide a helper to manually merge fetched historical messages with incoming ones
    mergeMessages: (historical: ChatMessage[]) => {
      // Historical messages + Any new messages from socket not already in historical
      const all = [...historical];
      realtimeMessages.forEach((rt) => {
        if (!all.find((h) => h._id === rt._id)) {
          all.push(rt);
        }
      });
      return all;
    },
  };
};
