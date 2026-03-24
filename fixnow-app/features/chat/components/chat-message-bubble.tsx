/**
 * Renders a single chat message bubble (text or image).
 */
import React, { useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import type { ChatMessage } from '../types/chat.types';

interface Props {
  item: ChatMessage;
  currentUserId: string | undefined;
}

export const ChatMessageBubble = ({ item, currentUserId }: Props) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const senderId = typeof item.sender === 'string' ? item.sender : item.sender?._id;
  const isMine = senderId === currentUserId;

  return (
    <>
      <View className={`flex-row mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {/* Partner avatar (only for received messages) */}
        {!isMine && (
          <View className="w-8 h-8 rounded-full bg-secondary mr-2 items-center justify-center overflow-hidden flex-shrink-0 self-end">
            {item.sender.avatar ? (
              <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-secondary-foreground text-xs font-bold">
                {(item.sender.fullName?.[0] ?? '?').toUpperCase()}
              </Text>
            )}
          </View>
        )}

        {/* Bubble */}
        <View
          className={`max-w-[75%] rounded-2xl px-3 py-2 ${
            isMine ? 'bg-primary rounded-tr-sm' : 'bg-secondary rounded-tl-sm'
          }`}
        >
          {item.type === 'IMAGE' ? (
            <Pressable onPress={() => setFullscreenImage(item.content)}>
              <Image
                source={{ uri: item.content }}
                className="w-48 h-48 rounded-[10px]"
                resizeMode="cover"
              />
            </Pressable>
          ) : (
            <Text
              className={`text-base leading-5 ${
                isMine ? 'text-primary-foreground' : 'text-foreground'
              }`}
            >
              {item.content}
            </Text>
          )}
          <Text
            className={`text-[10px] mt-1 ${
              isMine ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground text-left'
            }`}
          >
            {format(new Date(item.createdAt), 'HH:mm')}
          </Text>
        </View>
      </View>

      {/* Full-screen image modal — self-contained so each bubble owns its preview */}
      <Modal visible={!!fullscreenImage} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/90 justify-center items-center"
          onPress={() => setFullscreenImage(null)}
        >
          <Pressable
            className="absolute top-12 right-5 z-50 p-2 bg-white/10 rounded-full"
            onPress={() => setFullscreenImage(null)}
          >
            <Feather name="x" size={24} color="white" />
          </Pressable>
          {fullscreenImage && (
            <Image
              source={{ uri: fullscreenImage }}
              className="w-full h-4/5"
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </>
  );
};
