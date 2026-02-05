import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { NoteCard } from "./NoteCard";
import type { Note } from "../types";

interface NotesListProps {
  notes: Note[];
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  emptyMessage?: string;
  showCreateButton?: boolean;
  variant?: 'default' | 'compact';
}

export function NotesList({ 
  notes, 
  isLoading = false, 
  isRefetching = false,
  onRefresh,
  emptyMessage = "No notes yet. Create your first note!",
  showCreateButton = true,
  variant = 'default'
}: NotesListProps) {
  const router = useRouter();

  const renderNoteItem = ({ item }: { item: Note }) => (
    <NoteCard note={item} variant={variant} />
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6b7280" />
        <Text className="text-muted-foreground mt-4">Loading notes...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      renderItem={renderNoteItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center py-12">
          <Feather name="file-text" size={48} color="#d1d5db" />
          <Text className="text-muted-foreground text-center mt-4 mb-4">
            {emptyMessage}
          </Text>
          {showCreateButton && (
            <Button
              onPress={() => router.push("/notes/create")}
              variant="outline"
            >
              <Text>Create Note</Text>
            </Button>
          )}
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}