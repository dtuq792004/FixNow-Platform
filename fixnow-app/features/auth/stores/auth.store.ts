import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  forgotPasswordApi,
  loginApi,
  logoutApi,
  registerApi,
  resetPasswordApi,
} from "~/features/auth/services/auth.service";
import type {
  AuthError,
  AuthSession,
  AuthUser,
} from "~/features/auth/types/auth.types";

// ─── State & Action interfaces ────────────────────────────────────────────────

interface AuthState {
  // State
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;

  // Actions
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => Promise<{ error?: AuthError }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: AuthError }>;

  signOut: () => Promise<{ error?: AuthError }>;

  requestPasswordReset: (
    email: string
  ) => Promise<{ error?: AuthError; resetUrl?: string }>;

  resetPassword: (
    resetToken: string,
    newPassword: string
  ) => Promise<{ error?: AuthError }>;

  // Placeholder – backend chưa có OTP flow
  verifyOtp: (email: string, token: string) => Promise<{ error?: AuthError }>;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;

  // Internal helpers
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      user: null,
      session: null,
      loading: true,

      // ── Sign Up ─────────────────────────────────────────────────────────────
      signUp: async (email, password, fullName, phone) => {
        try {
          set({ loading: true });
          await registerApi(email, password, fullName, phone);
          // Backend không tự đăng nhập sau register → chỉ báo thành công
          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // ── Sign In ─────────────────────────────────────────────────────────────
      signIn: async (email, password) => {
        try {
          set({ loading: true });
          const res = await loginApi(email, password);

          const session: AuthSession = {
            access_token: res.data.token,
            user: res.data.user,
          };

          set({ user: res.data.user, session });
          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // ── Sign Out ────────────────────────────────────────────────────────────
      signOut: async () => {
        try {
          set({ loading: true });
          await logoutApi();
          set({ user: null, session: null });
          return { error: undefined };
        } catch (error) {
          // Kể cả khi API lỗi vẫn clear local session
          set({ user: null, session: null });
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // ── Request Password Reset ──────────────────────────────────────────────
      requestPasswordReset: async (email) => {
        try {
          set({ loading: true });
          const res = await forgotPasswordApi(email);
          return { error: undefined, resetUrl: res.resetUrl };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // ── Reset Password ──────────────────────────────────────────────────────
      // Signature đã thay đổi: (resetToken, newPassword) thay vì (email, code, password)
      resetPassword: async (resetToken, newPassword) => {
        try {
          set({ loading: true });
          await resetPasswordApi(resetToken, newPassword);
          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // ── Placeholders (backend chưa implement) ───────────────────────────────
      verifyOtp: async (_email, _token) => {
        return { error: undefined };
      },

      resendConfirmation: async (_email) => {
        return { error: undefined };
      },

      // ── Internal helpers ────────────────────────────────────────────────────
      setUser: (user) => set({ user }),
      setSession: (session) =>
        set({ session, user: session?.user ?? null }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist user và session, không persist loading
      partialize: (state: AuthState) => ({
        user: state.user,
        session: state.session,
      }),
      // Set loading = false sau khi hydrate xong từ AsyncStorage
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ loading: false });
      },
    }
  )
);

// ─── Selectors (tránh re-render không cần thiết) ──────────────────────────────

export const useUser = () => useAuthStore((s) => s.user);
export const useSession = () => useAuthStore((s) => s.session);
export const useAuthLoading = () => useAuthStore((s) => s.loading);
export const useSignUp = () => useAuthStore((s) => s.signUp);
export const useSignIn = () => useAuthStore((s) => s.signIn);
export const useSignOut = () => useAuthStore((s) => s.signOut);
export const useVerifyOtp = () => useAuthStore((s) => s.verifyOtp);
export const useResendConfirmation = () =>
  useAuthStore((s) => s.resendConfirmation);
export const useRequestPasswordReset = () =>
  useAuthStore((s) => s.requestPasswordReset);
export const useResetPassword = () => useAuthStore((s) => s.resetPassword);
