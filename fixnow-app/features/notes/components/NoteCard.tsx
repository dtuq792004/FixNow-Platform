import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { getCategoryColor, getCategoryLabel } from "~/utils/categories";
import { format, formatDistanceToNow } from "date-fns";
import type { Note } from "../types";

interface NoteCardProps {
  note: Note;
  variant?: 'default' | 'compact';
  showCategory?: boolean;
  onPress?: () => void;
}

export function NoteCard({ 
  note, 
  variant = 'default', 
  showCategory = true, 
  onPress 
}: NoteCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/notes/edit?id=${note.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (variant === 'compact') {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    }
    return format(new Date(dateString), "MMM d, yyyy 'at' HH:mm");
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card className="mb-3">
          <CardContent className="p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-base mb-1" numberOfLines={1}>
                  {note.title}
                </Text>
                {showCategory && (
                  <View className="flex-row items-center mb-2">
                    <View 
                      style={{
                        backgroundColor: getCategoryColor(note.category),
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 10,
                        marginRight: 8,
                      }}
                    >
                      <Text 
                        style={{
                          color: 'white',
                          fontSize: 11,
                          fontWeight: '500',
                        }}
                      >
                        {getCategoryLabel(note.category)}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted-foreground">
                      {formatDate(note.updated_at)}
                    </Text>
                  </View>
                )}
                <Text className="text-muted-foreground" numberOfLines={2}>
                  {note.content}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card className="mb-3">
        <CardHeader className="pb-2">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg mb-1" numberOfLines={2}>
                {note.title}
              </Text>
              {showCategory && (
                <View className="flex-row items-center mb-1">
                  <View 
                    style={{
                      backgroundColor: getCategoryColor(note.category),
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  >
                    <Text 
                      style={{
                        color: 'white',
                        fontSize: 12,
                        fontWeight: '500',
                      }}
                    >
                      {getCategoryLabel(note.category)}
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground">
                    {formatDate(note.updated_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </CardHeader>
        <CardContent className="pt-0">
          <Text className="text-muted-foreground" numberOfLines={3}>
            {note.content}
          </Text>
          {note.tags && note.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-2">
              {note.tags.slice(0, 3).map((tag, index) => (
                <View key={index} className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                  <Text className="text-xs text-gray-600">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}