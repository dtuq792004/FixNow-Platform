import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser, useAuthLoading } from "~/features/auth/stores/auth.store";
import { useActiveMode } from "~/features/app/stores/app-mode.store";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useUser();
  const loading = useAuthLoading();
  const activeMode = useActiveMode();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  if (user.role === "PROVIDER" && activeMode === "provider") {
    return <Redirect href="/(provider-tabs)" />;
  }

  return (
    <>
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

      {/* AI assistant FAB — navigates to full-screen chat */}
      <Pressable
        onPress={() => router.push("/chat/ai")}
        className="absolute right-5 w-14 h-14 rounded-full bg-zinc-900 items-center justify-center shadow-md"
        style={{ bottom: insets.bottom + 64 }}
        accessibilityRole="button"
        accessibilityLabel="Mở trợ lý AI"
      >
        <Feather name="cpu" size={22} color="#fff" />
      </Pressable>
    </>
  );
};

export default TabsLayout;
