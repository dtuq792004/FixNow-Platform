import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
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
import {
  useAuthLoading,
  useRequestPasswordReset,
  useResetPassword,
} from "~/features/auth/stores/auth.store";
import { mapAuthError } from "~/features/auth/utils/auth-errors";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "~/lib/validations";

type ForgotPasswordStep = "request" | "reset" | "success";

export default function ForgotPasswordScreen() {
  const requestPasswordReset = useRequestPasswordReset();
  const resetPassword = useResetPassword();
  const loading = useAuthLoading();
  const router = useRouter();

  const [step, setStep] = React.useState<ForgotPasswordStep>("request");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [isNavigating, setIsNavigating] = React.useState(false);

  // ── Request reset form ──────────────────────────────────────────────────────
  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    formState: { isSubmitting: isRequestSubmitting, errors: requestErrors },
    setError: setRequestError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { emailAddress: "" },
  });

  // ── Reset password form ─────────────────────────────────────────────────────
  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { isSubmitting: isResetSubmitting, errors: resetErrors },
    setError: setResetError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { resetToken: "", password: "", confirmPassword: "" },
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const onRequestReset = async (data: ForgotPasswordFormData) => {
    const { error } = await requestPasswordReset(data.emailAddress);

    if (error) {
      const errorInfo = mapAuthError(error);
      setRequestError("root", { message: errorInfo.message });
    } else {
      setUserEmail(data.emailAddress);
      setStep("reset");
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    // Signature mới: resetPassword(resetToken, newPassword)
    const { error } = await resetPassword(data.resetToken, data.password);

    if (error) {
      const errorInfo = mapAuthError(error);
      setResetError("root", { message: errorInfo.message });
    } else {
      setStep("success");
    }
  };

  const handleBackToSignIn = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace("/(auth)/sign-in");
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleBackToRequest = () => {
    setStep("request");
    setUserEmail("");
  };

  // ── Step 1: Request reset ───────────────────────────────────────────────────
  if (step === "request") {
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
                <CardTitle>Forgot Password?</CardTitle>
                <CardDescription>
                  Enter your email address and we&apos;ll send you a link to
                  reset your password
                </CardDescription>
              </CardHeader>

              <CardContent>
                <FormGroup>
                  <Controller
                    control={requestControl}
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

                  {requestErrors?.root && (
                    <Text className="text-destructive mb-4 text-center">
                      {requestErrors.root.message}
                    </Text>
                  )}

                  <Button
                    onPress={handleRequestSubmit(onRequestReset)}
                    disabled={loading || isRequestSubmitting}
                    className="mb-3"
                  >
                    <Text>
                      {isRequestSubmitting || loading
                        ? "Sending..."
                        : "Send Reset Link"}
                    </Text>
                  </Button>

                  <Button
                    variant="outline"
                    onPress={handleBackToSignIn}
                    disabled={isNavigating}
                  >
                    <Text>Back to Sign In</Text>
                  </Button>
                </FormGroup>
              </CardContent>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Step 2: Enter token + new password ─────────────────────────────────────
  if (step === "reset") {
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
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>
                  Check your email ({userEmail}) for the password reset link,
                  then copy the token here
                </CardDescription>
              </CardHeader>

              <CardContent>
                <View className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <Text className="text-blue-800 text-center text-sm">
                    📧 A reset link has been sent to your email.{"\n"}
                    Open the link and copy the token from the URL.
                  </Text>
                </View>

                <FormGroup>
                  {/* Reset Token */}
                  <Controller
                    control={resetControl}
                    name="resetToken"
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <FormFieldWrapper
                        label="Reset Token"
                        error={error?.message}
                        description="Paste the token from the reset link in your email"
                        required
                        className="mb-4"
                      >
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Paste reset token here"
                          autoCapitalize="none"
                          autoCorrect={false}
                          className={error ? "border-destructive" : undefined}
                        />
                      </FormFieldWrapper>
                    )}
                  />

                  {/* New Password */}
                  <Controller
                    control={resetControl}
                    name="password"
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <FormFieldWrapper
                        label="New Password"
                        error={error?.message}
                        required
                        className="mb-4"
                      >
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Enter new password"
                          secureTextEntry={true}
                          className={error ? "border-destructive" : undefined}
                        />
                      </FormFieldWrapper>
                    )}
                  />

                  {/* Confirm Password */}
                  <Controller
                    control={resetControl}
                    name="confirmPassword"
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <FormFieldWrapper
                        label="Confirm Password"
                        error={error?.message}
                        required
                        className="mb-4"
                      >
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Confirm new password"
                          secureTextEntry={true}
                          className={error ? "border-destructive" : undefined}
                        />
                      </FormFieldWrapper>
                    )}
                  />

                  {resetErrors?.root && (
                    <Text className="text-destructive mb-4 text-center">
                      {resetErrors.root.message}
                    </Text>
                  )}

                  <Button
                    onPress={handleResetSubmit(onResetPassword)}
                    disabled={loading || isResetSubmitting}
                    className="mb-3"
                  >
                    <Text>
                      {isResetSubmitting || loading
                        ? "Resetting..."
                        : "Reset Password"}
                    </Text>
                  </Button>

                  <Button variant="outline" onPress={handleBackToRequest}>
                    <Text>Back</Text>
                  </Button>
                </FormGroup>
              </CardContent>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Step 3: Success ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-4 pt-16 pb-6 justify-center">
          <Card className="mx-4">
            <CardHeader className="text-center">
              <CardTitle>Password Reset Successful! ✅</CardTitle>
              <CardDescription>
                Your password has been reset successfully
              </CardDescription>
            </CardHeader>

            <CardContent>
              <View className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <Text className="text-green-800 text-center font-medium mb-2">
                  🎉 All Set!
                </Text>
                <Text className="text-green-700 text-center text-sm">
                  You can now sign in with your new password
                </Text>
              </View>

              <Button onPress={handleBackToSignIn} disabled={isNavigating}>
                <Text>Go to Sign In</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
