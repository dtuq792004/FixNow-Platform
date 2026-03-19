// User type matching backend User model
export type AuthUser = {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
};

// Session stored on the client
export type AuthSession = {
  access_token: string;
  user: AuthUser;
};

// Generic auth error shape
export type AuthError = {
  message: string;
  status?: number;
};

// ─── Backend Response Shapes ─────────────────────────────────────────────────

// POST /auth/login → { message, accessToken, user }
export type LoginResponseData = {
  message: string;
  accessToken: string;
  user: AuthUser;
};

// POST /auth/register → { message, user }
export type RegisterResponseData = {
  message: string;
  user: AuthUser;
};

// POST /auth/forgot-password → { message, otp? (dev only) }
export type ForgotPasswordResponseData = {
  message: string;
  otp?: string;
};

// POST /auth/reset-password → { message }
export type ResetPasswordResponseData = {
  message: string;
};
