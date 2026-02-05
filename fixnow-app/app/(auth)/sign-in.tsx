import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { FormFieldWrapper, FormGroup } from "~/components/ui/form-control";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useAuthLoading, useSignIn } from "~/features/auth/stores/auth.store";
import { mapAuthError } from "~/features/auth/utils/auth-errors";
import { signInSchema, type SignInFormData } from "~/lib/validations";

export default function SignInScreen() {
  const signIn = useSignIn();
  const loading = useAuthLoading();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  const onSignInPress = async (data: SignInFormData) => {
    const { error } = await signIn(data.emailAddress, data.password);

    if (error) {
      const errorInfo = mapAuthError(error);

      setError("root", {
        message: errorInfo.message,
      });
    } else {
      router.replace("/");
    }
  };

  const handleSignUpNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace("/sign-up");
    // Reset after navigation
    setTimeout(() => setIsNavigating(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-4 pt-16 pb-6 justify-center">
          <Card className="mx-4">
            <CardHeader className="text-center">
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>

            <CardContent>
              <FormGroup>
                <Controller
                  control={control}
                  name="emailAddress"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <FormFieldWrapper
                      label="Email"
                      error={error?.message}
                      required
                      className="mb-4"
                    >
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className={error && "border-destructive"}
                      />
                    </FormFieldWrapper>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <FormFieldWrapper
                      label="Password"
                      error={error?.message}
                      required
                      className="mb-4"
                    >
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your password"
                        secureTextEntry={true}
                        className={error && "border-destructive"}
                      />
                    </FormFieldWrapper>
                  )}
                />
                {errors?.root && (
                  <Text className="text-destructive mb-4 text-center">
                    {errors.root.message}
                  </Text>
                )}
                <Button
                  onPress={handleSubmit(onSignInPress)}
                  disabled={loading || isSubmitting}
                >
                  <Text>
                    {isSubmitting || loading ? "Signing In..." : "Sign In"}
                  </Text>
                </Button>
              </FormGroup>
            </CardContent>
          </Card>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </Text>
            <Text
              className="text-primary font-medium ml-1"
              onPress={handleSignUpNavigation}
              suppressHighlighting={true}
            >
              Sign up
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
