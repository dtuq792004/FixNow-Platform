import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
import { useAuthLoading, useSignUp } from "~/features/auth/stores/auth.store";
import { mapAuthError } from "~/features/auth/utils/auth-errors";
import { signUpSchema, type SignUpFormData } from "~/lib/validations";

export default function SignUpScreen() {
  const signUp = useSignUp();
  const loading = useAuthLoading();
  const router = useRouter();
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [isNavigating, setIsNavigating] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      emailAddress: "",
      password: "",
    },
  });

  const onSignUpPress = async (data: SignUpFormData) => {
    const { error } = await signUp(data.emailAddress, data.password, data.fullName);

    if (error) {
      const errorInfo = mapAuthError(error);
      setError("root", { message: errorInfo.message });
    } else {
      setUserEmail(data.emailAddress);
      setPendingVerification(true);
    }
  };

  const onBackToSignUp = () => {
    setPendingVerification(false);
    setUserEmail("");
  };

  const handleSignInNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace("/sign-in");
    setTimeout(() => setIsNavigating(false), 1000);
  };

  // ── Success / Pending Verification screen ───────────────────────────────────
  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-4 pt-16 pb-6 justify-center">
            <Card className="mx-4">
              <CardHeader className="text-center">
                <CardTitle>Account Created! 🎉</CardTitle>
                <CardDescription>
                  Your account has been created successfully with {userEmail}.
                  You can now sign in.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <View className="space-y-4">
                  <View className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Text className="text-green-800 text-center font-medium mb-2">
                      Registration Successful ✅
                    </Text>
                    <Text className="text-green-700 text-center text-sm">
                      You can now sign in with your email and password.
                    </Text>
                  </View>

                  <Button
                    onPress={() => router.replace("/sign-in")}
                    className="mt-4"
                  >
                    <Text>Go to Sign In</Text>
                  </Button>

                  <Button
                    variant="outline"
                    onPress={onBackToSignUp}
                    className="mt-2"
                  >
                    <Text>Back to Sign Up</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Sign Up form ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 px-4 pt-16 pb-6 justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <Card className="mx-4">
            <CardHeader className="text-center">
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Sign up to get started</CardDescription>
            </CardHeader>

            <CardContent>
              <FormGroup>
                {/* Full Name */}
                <Controller
                  control={control}
                  name="fullName"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <FormFieldWrapper
                      label="Full Name"
                      error={error?.message}
                      required
                      className="mb-4"
                    >
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                        className={error ? "border-destructive" : undefined}
                      />
                    </FormFieldWrapper>
                  )}
                />

                {/* Email */}
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
                        className={error ? "border-destructive" : undefined}
                      />
                    </FormFieldWrapper>
                  )}
                />

                {/* Password */}
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
                      description="Min 8 characters · uppercase · lowercase · number"
                      required
                      className="mb-4"
                    >
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your password"
                        secureTextEntry={true}
                        className={error ? "border-destructive" : undefined}
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
                  onPress={handleSubmit(onSignUpPress)}
                  disabled={loading || isSubmitting}
                >
                  <Text>
                    {isSubmitting || loading
                      ? "Creating Account..."
                      : "Create Account"}
                  </Text>
                </Button>
              </FormGroup>
            </CardContent>
          </Card>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-muted-foreground">
              Already have an account?{" "}
            </Text>
            <Text
              className="text-primary font-medium ml-1"
              onPress={handleSignInNavigation}
              suppressHighlighting={true}
            >
              Sign in
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
