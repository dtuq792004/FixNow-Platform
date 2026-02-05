import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { FormFieldWrapper, FormGroup } from "~/components/ui/form-control";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Text } from "~/components/ui/text";
import { useNoteQuery } from "~/features/notes/hooks/useNotesQuery";
import { useUpdateNoteMutation, useDeleteNoteMutation } from "~/features/notes/hooks/useNotesMutation";
import { CategorySelector } from "~/features/notes/components/CategorySelector";
import type { Note } from "~/features/notes/types";

const editNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required"),
});

type EditNoteFormData = z.infer<typeof editNoteSchema>;

export default function EditNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: note, isLoading: loading } = useNoteQuery(id!);
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const [selectedCategory, setSelectedCategory] = useState('general');
  

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    reset,
  } = useForm<EditNoteFormData>({
    resolver: zodResolver(editNoteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content,
      });
      setSelectedCategory(note.category || 'general');
    }
  }, [note, reset]);


  const handleDelete = () => {
    if (!note) return;
    
    Alert.alert(
      "Delete Note",
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteNoteMutation.mutate(note.id, {
              onSuccess: (result) => {
                if (result.error) {
                  Alert.alert("Error", result.error);
                } else {
                  Alert.alert("Success", "Note deleted successfully!", [
                    { text: "OK", onPress: () => router.back() },
                  ]);
                }
              },
              onError: (error) => {
                Alert.alert("Error", error.message);
              },
            });
          },
        },
      ]
    );
  };

  const onSubmit = async (data: EditNoteFormData) => {
    if (!id) return;

    updateNoteMutation.mutate({ id, data: { ...data, category: selectedCategory } }, {
      onSuccess: (result) => {
        if (result.error) {
          setError("root", { message: result.error });
        } else {
          Alert.alert("Success", "Note updated successfully!", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      },
      onError: (error) => {
        setError("root", { message: error.message });
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text>Loading note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text>Note not found</Text>
          <Button onPress={() => router.back()} variant="outline" className="mt-4">
            <Text>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-bold">Edit Note</Text>
              <Text className="text-muted-foreground">
                Update your note content
              </Text>
            </View>
            <View className="flex flex-row">
              <Button
                variant="outline"
                onPress={handleDelete}
                size="sm"
                className="mr-2"
              >
                <Feather name="trash-2" size={16} color="#ef4444" />
              </Button>
              <Button
                variant="outline"
                onPress={() => router.back()}
                size="sm"
              >
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>

          {/* Form */}
          <FormGroup>
            <Controller
              control={control}
              name="title"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <FormFieldWrapper
                  label="Title"
                  error={error?.message}
                  required
                  className="mb-4"
                >
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter note title"
                    className={error && "border-destructive"}
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              control={control}
              name="content"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <FormFieldWrapper
                  label="Content"
                  error={error?.message}
                  required
                  className="mb-4"
                >
                  <Textarea
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Write your note content here..."
                    numberOfLines={10}
                    className={`min-h-[200px] ${error && "border-destructive"}`}
                  />
                </FormFieldWrapper>
              )}
            />

            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              className="mb-4"
            />

            {errors?.root && (
              <Text className="text-destructive mb-4 text-center">
                {errors.root.message}
              </Text>
            )}

            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || updateNoteMutation.isPending}
              className="mt-4"
            >
              <Text>
                {isSubmitting || updateNoteMutation.isPending ? "Updating..." : "Update Note"}
              </Text>
            </Button>
          </FormGroup>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}