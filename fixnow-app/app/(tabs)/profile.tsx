import { Feather } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Card, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { SignOutButton } from "~/features/auth/components/sign-out-button";
import { useUser } from "~/features/auth/stores/auth.store";
import { settingsOptions } from "~/features/profile/data/settingsOptions";
import { useActivitiesQuery } from "~/features/profile/hooks/useActivitiesQuery";
import { useUserStatsQuery } from "~/features/profile/hooks/useUserStatsQuery";
import { getAvatarInitial } from "~/utils/avatar";

const ProfileScreen = () => {
  const user = useUser();
  const { data: userStats, isLoading: statsLoading } = useUserStatsQuery();
  const { data: activities, isLoading: activitiesLoading } =
    useActivitiesQuery(3);

  return (
    <ScrollView className="flex-1 ">
      {/* Header Section */}
      <View className="bg-background px-4 py-8 shadow-sm pt-safe">
        <View className="items-center">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
            <Text className="text-primary-foreground font-bold text-2xl">
              {getAvatarInitial(user?.email)}
            </Text>
          </View>
          <Text className="text-2xl font-bold mb-1">
            {user?.user_metadata?.full_name ||
              user?.user_metadata?.firstName ||
              "User"}
          </Text>
          <Text className="text-base text-muted-foreground mb-2">
            {user?.email}
          </Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <Text className="text-sm text-muted-foreground">Active now</Text>
          </View>
        </View>
      </View>
      {/* Stats Section */}
      <View className="px-4 py-6">
        <Text className="text-xl font-semibold mb-4">Your Activity</Text>
        <View className="flex-row justify-between">
          <Card className="flex-1 mx-1">
            <CardContent className="p-4">
              <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mb-3">
                <Feather name="file-text" size={18} color="white" />
              </View>
              <Text className="text-2xl font-bold mb-1">
                {statsLoading ? "..." : userStats?.notes_count || 0}
              </Text>
              <Text className="text-sm text-muted-foreground">Notes</Text>
            </CardContent>
          </Card>

          <Card className="flex-1 mx-1">
            <CardContent className="p-4">
              <View className="w-10 h-10 bg-red-500 rounded-full items-center justify-center mb-3">
                <Feather name="heart" size={18} color="white" />
              </View>
              <Text className="text-2xl font-bold mb-1">
                {statsLoading ? "..." : userStats?.favorite_notes_count || 0}
              </Text>
              <Text className="text-sm text-muted-foreground">Favorites</Text>
            </CardContent>
          </Card>

          <Card className="flex-1 mx-1">
            <CardContent className="p-4">
              <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mb-3">
                <Feather name="folder" size={18} color="white" />
              </View>
              <Text className="text-2xl font-bold mb-1">
                {statsLoading ? "..." : userStats?.categories?.length || 0}
              </Text>
              <Text className="text-sm text-muted-foreground">Categories</Text>
            </CardContent>
          </Card>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-4 pb-6">
        <Text className="text-xl font-semibold mb-4">Recent Activity</Text>
        {activitiesLoading ? (
          <Text className="text-muted-foreground text-center py-4">
            Loading activities...
          </Text>
        ) : activities && activities.length > 0 ? (
          activities.map((activity) => (
            <Card key={activity.id} className="mb-3">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <View
                    className={`w-10 h-10 ${activity.icon_color} rounded-full items-center justify-center mr-3`}
                  >
                    <Feather
                      name={activity.icon as any}
                      size={16}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium mb-1">
                      {activity.title}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))
        ) : (
          <Text className="text-muted-foreground text-center py-4">
            No recent activities
          </Text>
        )}
      </View>

      {/* Settings Section */}
      <View className="px-4 pb-6">
        <Text className="text-xl font-semibold mb-4">Settings</Text>
        {settingsOptions.map((option, index) => (
          <Card key={index} className="mb-3">
            <CardContent className="p-4">
              <TouchableOpacity className="flex-row items-center">
                <View
                  className={`w-10 h-10 ${option.color} rounded-full items-center justify-center mr-4`}
                >
                  <Feather name={option.icon as any} size={18} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium mb-1">
                    {option.title}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {option.subtitle}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </CardContent>
          </Card>
        ))}
      </View>

      {/* Sign Out Section */}
      <View className="px-4 pb-8">
        <SignOutButton />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
