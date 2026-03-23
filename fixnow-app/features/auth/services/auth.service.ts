import apiClient from "~/lib/api-client";
import type {
  ForgotPasswordResponseData,
  LoginResponseData,
  RegisterResponseData,
  ResetPasswordResponseData,
} from "~/features/auth/types/auth.types";

/**
 * POST /auth/login
 * Body: { email, password }
 * Response: { message, accessToken, user }
 */
export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponseData> => {
  const { data } = await apiClient.post<LoginResponseData>("/auth/login", {
    email,
    password,
  });
  return data;
};

/**
 * POST /auth/register
 * Body: { email, password, fullName, phone? }
 * Response: { message, user }
 */
export const registerApi = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<RegisterResponseData> => {
  const { data } = await apiClient.post<RegisterResponseData>("/auth/register", {
    email,
    password,
    fullName,
    ...(phone ? { phone } : {}),
  });
  return data;
};

/**
 * POST /auth/logout
 * Response: { message }
 */
export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

/**
 * POST /auth/forgot-password
 * Body: { email }
 * Response: { message, otp? }
 */
export const forgotPasswordApi = async (
  email: string
): Promise<ForgotPasswordResponseData> => {
  const { data } = await apiClient.post<ForgotPasswordResponseData>(
    "/auth/forgot-password",
    { email }
  );
  return data;
};

/**
 * POST /auth/reset-password
 * Body: { resetToken, newPassword, confirmPassword }
 * Response: { message }
 */
export const resetPasswordApi = async (
  resetToken: string,
  newPassword: string
): Promise<ResetPasswordResponseData> => {
  const { data } = await apiClient.post<ResetPasswordResponseData>(
    "/auth/reset-password",
    { resetToken, newPassword, confirmPassword: newPassword }
  );
  return data;
};

/**
 * POST /auth/verify-otp
 * Body: { otp }
 * Response: { message, resetToken? }
 */
export const verifyOtpApi = async (
  otp: string
): Promise<{ message: string; resetToken?: string }> => {
  const { data } = await apiClient.post<{ message: string; resetToken?: string }>(
    "/auth/verify-otp",
    { otp }
  );
  return data;
};
