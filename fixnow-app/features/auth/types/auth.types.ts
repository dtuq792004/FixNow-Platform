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

// Generic auth error shape (không phụ thuộc Supabase)
export type AuthError = {
  message: string;
  status?: number;
};

// ─── Backend Response Shapes ─────────────────────────────────────────────────

export type LoginResponseData = {
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export type RegisterResponseData = {
  message: string;
  user: AuthUser;
};

export type ForgotPasswordResponseData = {
  message: string;
  resetUrl: string;
};
