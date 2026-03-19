// Common error type keys for easy reuse across the auth feature
export const AUTH_ERROR_TYPES = {
  INVALID_CREDENTIALS: "invalid_credentials",
  EMAIL_NOT_CONFIRMED: "email_not_confirmed",
  TOO_MANY_REQUESTS: "too_many_requests",
  NETWORK_ERROR: "network_error",
  SERVER_ERROR: "server_error",
  USER_NOT_FOUND: "user_not_found",
  ACCOUNT_LOCKED: "account_locked",
} as const;
