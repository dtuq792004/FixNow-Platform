import type { AuthError } from "~/features/auth/types/auth.types";

export interface AuthErrorInfo {
  message: string;
  type: "validation" | "auth" | "network" | "server" | "unknown";
  canRetry: boolean;
  suggestions?: string[];
}

export function mapAuthError(error: AuthError | null): AuthErrorInfo {
  if (!error) {
    return {
      message: "An unknown error occurred",
      type: "unknown",
      canRetry: false,
    };
  }

  const errorMessage = error.message.toLowerCase();
  const errorCode = error.status;

  // Invalid credentials
  if (
    errorMessage.includes("invalid password") ||
    errorMessage.includes("invalid login credentials")
  ) {
    return {
      message: "Invalid email or password",
      type: "auth",
      canRetry: false,
      suggestions: [
        "Double-check your email and password",
        "Make sure you entered the correct information",
        "Try resetting your password if forgotten",
      ],
    };
  }

  // User not found
  if (
    errorMessage.includes("user not found") ||
    errorMessage.includes("invalid user")
  ) {
    return {
      message: "Account does not exist",
      type: "auth",
      canRetry: false,
      suggestions: [
        "Double-check the email address",
        "Create a new account if you don't have one",
        "Contact support if needed",
      ],
    };
  }

  // Email already exists (register)
  if (
    errorMessage.includes("email already exists") ||
    errorMessage.includes("user already exists")
  ) {
    return {
      message: "Email is already registered",
      type: "validation",
      canRetry: false,
      suggestions: [
        "Try signing in instead",
        "Use a different email address",
        "Reset your password if you forgot it",
      ],
    };
  }

  // Account banned/locked/disabled
  if (
    errorMessage.includes("banned") ||
    errorMessage.includes("account locked") ||
    errorMessage.includes("user disabled")
  ) {
    return {
      message: "Account has been locked or banned",
      type: "auth",
      canRetry: false,
      suggestions: [
        "Contact support to unlock your account",
        "Check your email for system notifications",
      ],
    };
  }

  // Invalid or expired reset token
  if (
    errorMessage.includes("invalid or expired token") ||
    errorMessage.includes("invalid or expired")
  ) {
    return {
      message: "Reset token is invalid or has expired",
      type: "validation",
      canRetry: false,
      suggestions: [
        "Request a new password reset link",
        "Make sure you copied the full token from the email",
        "The token expires after 15 minutes",
      ],
    };
  }

  // Email not confirmed
  if (errorMessage.includes("email not confirmed")) {
    return {
      message: "Email address not verified",
      type: "validation",
      canRetry: false,
      suggestions: [
        "Check your email inbox to verify your account",
        "Also check your spam folder",
        "Request a new verification email",
      ],
    };
  }

  // Too many requests
  if (errorMessage.includes("too many requests") || errorCode === 429) {
    return {
      message: "Too many requests. Please slow down.",
      type: "validation",
      canRetry: true,
      suggestions: [
        "Please wait a few minutes before trying again",
        "Avoid entering wrong password multiple times",
      ],
    };
  }

  // Invalid email format
  if (
    errorMessage.includes("invalid email") ||
    errorMessage.includes("email format")
  ) {
    return {
      message: "Invalid email format",
      type: "validation",
      canRetry: false,
      suggestions: [
        "Enter email in correct format (e.g., user@example.com)",
        "Remove any extra spaces",
      ],
    };
  }

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection") ||
    errorCode === 0
  ) {
    return {
      message: "Network connection error",
      type: "network",
      canRetry: true,
      suggestions: [
        "Check your internet connection",
        "Try again in a few seconds",
        "Restart the app if needed",
      ],
    };
  }

  // Server errors (5xx)
  if (errorCode !== undefined && errorCode >= 500) {
    return {
      message: "Temporary server error",
      type: "server",
      canRetry: true,
      suggestions: [
        "Please try again in a few minutes",
        "Server is under maintenance or overloaded",
      ],
    };
  }

  // Password too weak
  if (
    errorMessage.includes("password") &&
    (errorMessage.includes("weak") || errorMessage.includes("short"))
  ) {
    return {
      message: "Password is not strong enough",
      type: "validation",
      canRetry: false,
      suggestions: [
        "Password must be at least 8 characters long",
        "Include uppercase, lowercase, and numbers",
        "Use special characters for better security",
      ],
    };
  }

  // Generic fallback
  return {
    message: error.message || "An unknown error occurred",
    type: "unknown",
    canRetry: false,
    suggestions: ["Please try again", "Contact support if the error persists"],
  };
}

// Common error types for easy reuse
export const AUTH_ERROR_TYPES = {
  INVALID_CREDENTIALS: "invalid_credentials",
  EMAIL_NOT_CONFIRMED: "email_not_confirmed",
  TOO_MANY_REQUESTS: "too_many_requests",
  NETWORK_ERROR: "network_error",
  SERVER_ERROR: "server_error",
  USER_NOT_FOUND: "user_not_found",
  ACCOUNT_LOCKED: "account_locked",
} as const;
