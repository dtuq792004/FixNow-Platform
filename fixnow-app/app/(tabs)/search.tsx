import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useUser } from "~/features/auth/stores/auth.store";
import { NoteCard } from "~/features/notes/components/NoteCard";
import { useNotesQuery } from "~/features/notes/hooks/useNotesQuery";
import type { Note } from "~/features/notes/types";
import { getCategoryColor, getCategoryLabel } from "~/utils/categories";

const SearchScreen = () => {
  const user = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Search filters for notes
  const searchFilters = searchQuery.trim() ? { search: searchQuery } : {};
  const categoryFilters =
    selectedCategory !== "all" ? { category: selectedCategory } : {};

  const { data: notes = [], isLoading } = useNotesQuery({
    ...searchFilters,
    ...categoryFilters,
    limit: 50,
  });

  // Get unique categories from notes
  const { data: allNotes = [] } = useNotesQuery({ limit: 1000 });
  const categories = ["all", ...new Set(allNotes.map((note) => note.category))];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const renderNoteItem = ({ item }: { item: Note }) => <NoteCard note={item} />;

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-background px-4 pt-safe pb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold">Search Notes</Text>
            <Text className="text-muted-foreground mt-1">
              Find your notes quickly
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

        {/* Search Input */}
        <View className="relative mb-4">
          <Input
            placeholder="Search by title, content, or tags..."
            value={searchQuery}
            onChangeText={handleSearch}
            className="pr-10"
          />
          <View className="absolute right-3 top-3">
            <Feather name="search" size={20} color="#6b7280" />
          </View>
        </View>

        {/* Filters */}
        <View className="flex-row items-center justify-between">
          {/* Categories */}
          <View className="flex-1">
            <Text className="text-sm font-medium mb-2">Category</Text>
            <View className="flex-row flex-wrap">
              {categories.slice(0, 6).map((category) => {
                const isActive = selectedCategory === category;
                const categoryColor =
                  category === "all" ? "#3b82f6" : getCategoryColor(category);

                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => handleCategoryFilter(category)}
                    style={{
                      backgroundColor: isActive ? categoryColor : "#f3f4f6",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "white" : "#374151",
                        fontSize: 12,
                        fontWeight: isActive ? "600" : "400",
                      }}
                    >
                      {category === "all" ? "All" : getCategoryLabel(category)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* Results */}
      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6b7280" />
            <Text className="text-muted-foreground mt-4">Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-12">
                <Feather name="search" size={48} color="#d1d5db" />
                <Text className="text-muted-foreground text-center mt-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "No notes found matching your search"
                    : "Start typing to search your notes"}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default SearchScreen;
