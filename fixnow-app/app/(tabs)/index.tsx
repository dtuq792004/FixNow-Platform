import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useUser } from "~/features/auth/stores/auth.store";
import { useNotesQuery } from "~/features/notes/hooks/useNotesQuery";
import { useUserStatsQuery } from "~/features/profile/hooks/useUserStatsQuery";
import { useActivitiesQuery } from "~/features/profile/hooks/useActivitiesQuery";
import { formatDistanceToNow } from "date-fns";
import { NoteCard } from "~/features/notes/components/NoteCard";
import { ActivityCard } from "~/features/profile/components/ActivityCard";

const HomeScreen = () => {
  const user = useUser(); // Only subscribes to user changes
  const router = useRouter();
  
  // Get recent notes and activities
  const { data: recentNotes = [] } = useNotesQuery({ limit: 5 });
  const { data: activities = [] } = useActivitiesQuery(5);
  const { data: userStats } = useUserStatsQuery();

  return (
    <View className="flex-1">
      {/* Header Section */}
      <View className="bg-background shadow-sm pt-safe py-6 px-4 z-10">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold mb-1 mt-2">
              Welcome back!
            </Text>
            <Text className="text-base text-muted-foreground">
              {user?.email}
            </Text>
          </View>
          <Button
            onPress={() => router.push("/notes/create")}
            size="sm"
            className="px-4 flex flex-row items-center"
          >
            <Feather name="plus" size={16} color="white" />
            <Text className="ml-2 text-white">New Note</Text>
          </Button>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {/* Quick Stats */}
        <View className="mb-6">
          <Text className="text-xl font-semibold mb-4">Your Notes</Text>
          <View className="flex-row justify-between">
            <Card className="flex-1 mx-1">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                    <Feather name="file-text" size={16} color="white" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold">
                      {userStats?.notes_count || 0}
                    </Text>
                    <Text className="text-sm text-muted-foreground">Total Notes</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
            
            <Card className="flex-1 mx-1">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-3">
                    <Feather name="folder" size={16} color="white" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold">
                      {userStats?.categories?.length || 0}
                    </Text>
                    <Text className="text-sm text-muted-foreground">Categories</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Recent Notes */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold">Recent Notes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/notes")}>
              <Text className="text-primary">View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentNotes.length > 0 ? (
            recentNotes.slice(0, 3).map((note) => (
              <NoteCard key={note.id} note={note} variant="compact" />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 items-center">
                <Feather name="file-text" size={48} color="#d1d5db" />
                <Text className="text-muted-foreground text-center mt-4 mb-4">
                  No notes yet. Create your first note!
                </Text>
                <Button onPress={() => router.push("/notes/create")}>
                  <Text>Create Note</Text>
                </Button>
              </CardContent>
            </Card>
          )}
        </View>

        {/* Recent Activity */}
        <View className="mb-6">
          <Text className="text-xl font-semibold mb-4">Recent Activity</Text>
          
          {activities.length > 0 ? (
            activities.slice(0, 3).map((activity) => (
              <ActivityCard key={activity.id} activity={activity} variant="compact" />
            ))
          ) : (
            <Text className="text-muted-foreground text-center py-4">
              No recent activities
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
