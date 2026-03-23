import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  forgotPasswordApi,
  loginApi,
  logoutApi,
  registerApi,
  resetPasswordApi,
  verifyOtpApi,
} from "~/features/auth/services/auth.service";
import type {
  AuthError,
  AuthSession,
  AuthUser,
} from "~/features/auth/types/auth.types";

interface AuthState {
  // ── State ───────────────────────────────────────────────────────────────────
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;

  // ── Auth actions ─────────────────────────────────────────────────────────────
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  requestPasswordReset: (email: string) => Promise<{ error?: AuthError }>;
  resetPassword: (
    resetToken: string,
    newPassword: string
  ) => Promise<{ error?: AuthError }>;
  verifyOtp: (otp: string) => Promise<{ resetToken?: string; error?: AuthError }>;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;

  // ── Internal setters ─────────────────────────────────────────────────────────
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: false,

      // ── signIn ──────────────────────────────────────────────────────────────
      signIn: async (email, password) => {
        try {
          set({ loading: true });
          const res = await loginApi(email, password);
          const session: AuthSession = {
            access_token: res.accessToken,
            user: res.user,
          };
          set({ user: res.user, session });
          return {};
        } catch (err: any) {
          return {
            error: {
              message: err.message ?? "Đăng nhập thất bại",
              status: err.status,
            },
          };
        } finally {
          set({ loading: false });
        }
      },

      // ── signUp ──────────────────────────────────────────────────────────────
      signUp: async (email, password, fullName) => {
        try {
          set({ loading: true });
          await registerApi(email, password, fullName);
          return {};
        } catch (err: any) {
          return {
            error: {
              message: err.message ?? "Đăng ký thất bại",
              status: err.status,
            },
          };
        } finally {
          set({ loading: false });
        }
      },

      // ── signOut ─────────────────────────────────────────────────────────────
      signOut: async () => {
        try {
          set({ loading: true });
          // Best-effort — clear local state even if server call fails
          await logoutApi().catch(() => {});
          set({ user: null, session: null });
          return {};
        } catch (err: any) {
          return { error: { message: err.message ?? "Đăng xuất thất bại" } };
        } finally {
          set({ loading: false });
        }
      },

      // ── requestPasswordReset ─────────────────────────────────────────────────
      requestPasswordReset: async (email) => {
        try {
          set({ loading: true });
          await forgotPasswordApi(email);
          return {};
        } catch (err: any) {
          return {
            error: {
              message: err.message ?? "Không thể gửi email đặt lại mật khẩu",
              status: err.status,
            },
          };
        } finally {
          set({ loading: false });
        }
      },

      // ── resetPassword ────────────────────────────────────────────────────────
      resetPassword: async (resetToken, newPassword) => {
        try {
          set({ loading: true });
          await resetPasswordApi(resetToken, newPassword);
          return {};
        } catch (err: any) {
          return {
            error: {
              message: err.message ?? "Đặt lại mật khẩu thất bại",
              status: err.status,
            },
          };
        } finally {
          set({ loading: false });
        }
      },

      // ── verifyOtp / resendConfirmation (stubs — not used in current UI) ──────
      verifyOtp: async (otp: string) => {
        try {
          set({ loading: true });
          const res = await verifyOtpApi(otp);
          return { resetToken: res.resetToken };
        } catch (err: any) {
          return {
            error: {
              message: err.message ?? "OTP không hợp lệ hoặc đã hết hạn",
              status: err.status,
            },
          };
        } finally {
          set({ loading: false });
        }
      },
      resendConfirmation: async (_email) => ({}),

      // ── Internal setters ─────────────────────────────────────────────────────
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const useUser = () => useAuthStore((s) => s.user);
export const useSession = () => useAuthStore((s) => s.session);
export const useAuthLoading = () => useAuthStore((s) => s.loading);
export const useSignIn = () => useAuthStore((s) => s.signIn);
export const useSignUp = () => useAuthStore((s) => s.signUp);
export const useSignOut = () => useAuthStore((s) => s.signOut);
export const useVerifyOtp = () => useAuthStore((s) => s.verifyOtp);
export const useResendConfirmation = () => useAuthStore((s) => s.resendConfirmation);
export const useRequestPasswordReset = () => useAuthStore((s) => s.requestPasswordReset);
export const useResetPassword = () => useAuthStore((s) => s.resetPassword);
