import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser, useAuthLoading } from "~/features/auth/stores/auth.store";
import { useActiveMode } from "~/features/app/stores/app-mode.store";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const loading = useAuthLoading();
  const activeMode = useActiveMode();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  // Nếu là provider và đang ở mode provider → redirect sang provider tabs
  if (user.role === "PROVIDER" && activeMode === "provider") {
    return <Redirect href="/(provider-tabs)" />;
  }

  return (
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
  );
};
export default TabsLayout;
