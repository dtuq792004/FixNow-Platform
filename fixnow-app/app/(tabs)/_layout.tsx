import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser, useAuthLoading } from "~/features/auth/stores/auth.store";
import { useActiveMode } from "~/features/app/stores/app-mode.store";
import { useAiChat } from "~/features/chatbot/hooks/use-ai-chat";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const loading = useAuthLoading();
  const activeMode = useActiveMode();
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const { messages, sendMessage, isSending } = useAiChat();
  const reversedAiMessages = useMemo(() => [...messages].reverse(), [messages]);

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  // Nếu là provider và đang ở mode provider → redirect sang provider tabs
  if (user.role === "PROVIDER" && activeMode === "provider") {
    return <Redirect href="/(provider-tabs)" />;
  }

  const handleSendAi = () => {
    const text = aiInput.trim();
    if (!text || isSending) return;
    setAiInput("");
    sendMessage(text);
  };

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "hsl(240 5.9% 10%)",
          tabBarInactiveTintColor: "#657786",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#E1E8ED",
            height: 50 + insets.bottom,
            paddingTop: 8,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            title: "Yêu cầu",
            tabBarIcon: ({ color, size }) => (
              <Feather name="clipboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Tìm kiếm",
            tabBarIcon: ({ color, size }) => (
              <Feather name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Tài khoản",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="notes" options={{ href: null }} />
      </Tabs>

      <Pressable
        onPress={() => setIsAiModalVisible(true)}
        className="absolute right-5 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-md"
        style={{ bottom: insets.bottom + 64 }}
      >
        <Feather name="cpu" size={22} color="#fff" />
      </Pressable>

      <Modal
        visible={isAiModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAiModalVisible(false)}
      >
        <View className="flex-1 bg-black/30 justify-end">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View className="h-[90%] bg-background rounded-t-3xl overflow-hidden">
              <View className="flex-row items-center px-4 py-3 border-b border-border">
                <View className="w-8 h-8 rounded-full bg-primary/15 items-center justify-center mr-2">
                  <Feather name="cpu" size={16} color="#18181b" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Trợ lý AI</Text>
                  <Text className="text-xs text-muted-foreground">FixNow Assistant</Text>
                </View>
                <Pressable onPress={() => setIsAiModalVisible(false)} className="p-2 -mr-1">
                  <Feather name="x" size={20} color="#52525b" />
                </Pressable>
              </View>

              <FlatList
                data={reversedAiMessages}
                inverted
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isMine = item.role === "user";
                  return (
                    <View className={`mb-3 flex-row ${isMine ? "justify-end" : "justify-start"}`}>
                      <View
                        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                          isMine ? "bg-primary rounded-tr-sm" : "bg-secondary rounded-tl-sm"
                        }`}
                      >
                        <Text
                          className={`text-[15px] leading-5 ${
                            isMine ? "text-primary-foreground" : "text-foreground"
                          }`}
                        >
                          {item.content}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14 }}
                showsVerticalScrollIndicator={false}
              />

              <View className="border-t border-border bg-background px-4 py-3">
                <View className="flex-row items-end gap-2">
                  <View className="flex-1 rounded-2xl bg-secondary px-4 py-2 min-h-[40px]">
                    <TextInput
                      className="text-sm text-foreground max-h-32"
                      placeholder="Nhập câu hỏi cho AI..."
                      placeholderTextColor="#a1a1aa"
                      value={aiInput}
                      onChangeText={setAiInput}
                      multiline
                      editable={!isSending}
                      onSubmitEditing={handleSendAi}
                    />
                  </View>
                  <Pressable
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      aiInput.trim() ? "bg-primary" : "bg-muted"
                    }`}
                    onPress={handleSendAi}
                    disabled={!aiInput.trim() || isSending}
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
      </Modal>
    </View>
  );
};
export default TabsLayout;
