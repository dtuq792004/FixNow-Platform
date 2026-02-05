import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Dimensions,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useNotesQuery } from "~/features/notes/hooks/useNotesQuery";
import { NotesList } from "~/features/notes/components/NotesList";

const { width } = Dimensions.get("window");

export default function NotesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const {
    data: notes = [],
    isLoading,
    refetch,
    isRefetching,
  } = useNotesQuery({
    search: search || undefined,
    limit: 50,
  });

  const handleSearch = (text: string) => {
    setSearch(text);
  };


  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-background px-4 pt-safe pb-6 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold">My Notes</Text>
            <Text className="text-muted-foreground mt-1">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </Text>
          </View>
          <Button
            onPress={() => router.push("/notes/create")}
            size="sm"
            className="px-4 flex flex-row items-center"
          >
            <Feather name="plus" size={16} color="white" />
            <Text className="ml-2 text-white">New</Text>
          </Button>
        </View>

        {/* Search */}
        <View className="relative">
          <Input
            placeholder="Search notes..."
            value={search}
            onChangeText={handleSearch}
            className="pr-10"
          />
          <View className="absolute right-3 top-3">
            <Feather name="search" size={20} color="#6b7280" />
          </View>
        </View>
      </View>

      {/* Notes List */}
      <View className="flex-1 px-4">
        <NotesList
          notes={notes}
          isLoading={isLoading}
          isRefetching={isRefetching}
          onRefresh={refetch}
          emptyMessage={
            search
              ? "No notes found matching your search"
              : "No notes yet. Create your first note!"
          }
          showCreateButton={!search}
        />
      </View>
    </View>
  );
}
