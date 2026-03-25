import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAiChat } from '~/features/chatbot/hooks/use-ai-chat';

export default function AiChatScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const { messages, sendMessage, isSending } = useAiChat();

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header - Blue background like mockup */}
        <View className="bg-primary pt-safe px-4 pb-4 flex-row items-center border-b border-primary/20">
          <Pressable onPress={() => router.back()} className="p-1 mr-2" hitSlop={10}>
            <Feather name="chevron-left" size={26} color="#ffffff" />
          </Pressable>
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
            <View className="bg-primary/10 w-8 h-8 rounded-full items-center justify-center">
              <Feather name="cpu" size={18} color="#0066FF" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-[17px] font-bold text-white">FixNow Chatbot</Text>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
              <Text className="text-xs text-white/80">Trợ lý ảo đang hoạt động</Text>
            </View>
          </View>
          <Pressable className="p-1">
            <Feather name="more-horizontal" size={22} color="#ffffff" />
          </Pressable>
        </View>

        <FlatList
          data={reversedMessages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isBot = item.role === 'assistant';
            return (
              <View className={`mb-4 flex-row ${isBot ? 'justify-start' : 'justify-end'}`}>
                {isBot && (
                  <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2 self-end">
                    <Feather name="cpu" size={14} color="#ffffff" />
                  </View>
                )}
                <View
                  className={`max-w-[75%] px-4 py-2.5 ${isBot
                      ? 'bg-white rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm'
                      : 'bg-primary rounded-2xl rounded-br-sm'
                    }`}
                >
                  <Text
                    className={`text-[15px] leading-5 ${isBot ? 'text-gray-800' : 'text-white'
                      }`}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar - Rounded like mockup */}
        <View className="bg-white px-4 py-3 pb-safe border-t border-gray-100 shadow-lg">
          <View className="flex-row items-center bg-[#F3F4F6] rounded-full px-4 py-1.5 border border-gray-200">
            <TextInput
              className="flex-1 text-[15px] text-gray-800 py-1"
              placeholder="Hỏi AI bất kỳ điều gì..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              blurOnSubmit={false}
              editable={!isSending}
            />
            <View className="flex-row items-center gap-3">
              <Pressable hitSlop={5}>
                <Feather name="smile" size={20} color="#9CA3AF" />
              </Pressable>
              <Pressable hitSlop={5}>
                <Feather name="paperclip" size={19} color="#9CA3AF" />
              </Pressable>

              <Pressable
                onPress={handleSend}
                disabled={!input.trim() || isSending}
                className={`w-9 h-9 rounded-full items-center justify-center ${input.trim() ? 'bg-primary' : 'hidden'
                  }`}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="send" size={16} color="#fff" style={{ marginLeft: 1 }} />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
