import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as React from "react";
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
import { useSignUp, useAuthLoading } from "~/features/auth/stores/auth.store";
import { mapAuthError } from "~/features/auth/utils/auth-errors";
import { signUpSchema, type SignUpFormData } from "~/lib/validations";

export default function SignUpScreen() {
  const signUp = useSignUp();
  const loading = useAuthLoading();
  const router = useRouter();
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Sign-up form
  const {
    control: signUpControl,
    handleSubmit: handleSignUpSubmit,
    formState: { isSubmitting: isSignUpSubmitting, errors: signUpErrors },
    setError: setSignUpError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  // Handle submission of sign-up form
  const onSignUpPress = async (data: SignUpFormData) => {
    const { error } = await signUp(data.emailAddress, data.password);

    if (error) {
      const errorInfo = mapAuthError(error);
      setSignUpError("root", {
        message: errorInfo.message,
      });
    } else {
      // Store email and show success message
      setUserEmail(data.emailAddress);
      setPendingVerification(true);
    }
  };

  // Handle back to signup form
  const onBackToSignUp = () => {
    setPendingVerification(false);
    setUserEmail("");
  };

  const handleSignInNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace("/sign-in");
    // Reset after navigation
    setTimeout(() => setIsNavigating(false), 1000);
  };

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
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  We&apos;ve sent a confirmation link to {userEmail}. Please
                  check your email and click the link to verify your account.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <View className="space-y-4">
                  <View className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Text className="text-green-800 text-center font-medium mb-2">
                      Account Created Successfully! ✅
                    </Text>
                    <Text className="text-green-700 text-center text-sm">
                      • Check your email inbox for the confirmation link{"\n"}•
                      Don&apos;t forget to check your spam folder{"\n"}• Click
                      the link to activate your account
                    </Text>
                  </View>

                  <Button
                    variant="outline"
                    onPress={onBackToSignUp}
                    className="mt-6"
                  >
                    <Text>Back to Sign Up</Text>
                  </Button>

                  <Button
                    variant="secondary"
                    onPress={() => router.replace("/sign-in")}
                    className="mt-2"
                  >
                    <Text>Go to Sign In</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-4 pt-16 pb-6 justify-center">
          <Card className="mx-4">
            <CardHeader className="text-center">
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Sign up to get started</CardDescription>
            </CardHeader>

            <CardContent>
              <FormGroup>
                <Controller
                  control={signUpControl}
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
                  control={signUpControl}
                  name="password"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <FormFieldWrapper
                      label="Password"
                      error={error?.message}
                      description="Must be at least 8 characters with uppercase, lowercase, and number"
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

                {signUpErrors?.root && (
                  <Text className="text-destructive mb-4 text-center">
                    {signUpErrors.root.message}
                  </Text>
                )}

                <Button
                  onPress={handleSignUpSubmit(onSignUpPress)}
                  disabled={loading || isSignUpSubmitting}
                >
                  <Text>
                    {isSignUpSubmitting || loading
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
