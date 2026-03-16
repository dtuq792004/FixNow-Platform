import apiClient from "~/lib/api-client";
import type {
  ForgotPasswordResponseData,
  LoginResponseData,
  RegisterResponseData,
} from "~/features/auth/types/auth.types";

/**
 * POST /auth/login
 * Body: { email, password }
 * Response 200: { message, data: { token, user } }
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
 * Response 201: { message, user }
 */
export const registerApi = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<RegisterResponseData> => {
  const { data } = await apiClient.post<RegisterResponseData>(
    "/auth/register",
    { email, password, fullName, ...(phone ? { phone } : {}) }
  );
  return data;
};

/**
 * POST /auth/logout
 * Response 200: { message: "Logout successful" }
 */
export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

/**
 * POST /auth/forgot-password
 * Body: { email }
 * Response 200: { message, resetUrl }
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
 * POST /auth/reset-password/:token
 * Body: { password }
 * Response 200: { message: "Password reset successful" }
 */
export const resetPasswordApi = async (
  resetToken: string,
  password: string
): Promise<void> => {
  await apiClient.post(`/auth/reset-password/${resetToken}`, { password });
};
