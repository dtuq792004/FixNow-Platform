import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { FormFieldWrapper, FormGroup } from "~/components/ui/form-control";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Text } from "~/components/ui/text";
import { useCreateNoteMutation } from "~/features/notes/hooks/useNotesMutation";
import { CategorySelector } from "~/features/notes/components/CategorySelector";

const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required"),
});

type CreateNoteFormData = z.infer<typeof createNoteSchema>;

export default function CreateNoteScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('general');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<CreateNoteFormData>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const createNoteMutation = useCreateNoteMutation();

  const onSubmit = async (data: CreateNoteFormData) => {
    createNoteMutation.mutate({
      title: data.title,
      content: data.content,
      category: selectedCategory
    }, {
      onSuccess: (result) => {
        if (result.error) {
          setError("root", { message: result.error });
        } else {
          Alert.alert("Success", "Note created successfully!", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      },
      onError: (error) => {
        setError("root", { message: error.message });
      },
    });
  };

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
              <Text className="text-2xl font-bold">Create Note</Text>
              <Text className="text-muted-foreground">
                Add a new note to your collection
              </Text>
            </View>
            <View className="flex flex-row">
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
              disabled={isSubmitting || createNoteMutation.isPending}
              className="mt-4"
            >
              <Text>
                {isSubmitting || createNoteMutation.isPending ? "Creating..." : "Create Note"}
              </Text>
            </Button>
          </FormGroup>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}