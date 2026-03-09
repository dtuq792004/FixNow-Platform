import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AuthError, Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// import { supabase } from "~/lib/supabase";

// Mock credentials for testing
const MOCK_USERS = [
  {
    email: "test@example.com",
    password: "password123",
    id: "mock-user-1",
    firstName: "Test",
    lastName: "User",
  },
  {
    email: "admin@test.com",
    password: "admin123",
    id: "mock-user-2",
    firstName: "Admin",
    lastName: "User",
  },
];

// Temporary types until you implement your own auth
type AuthError = { message: string; status?: number };
type User = {
  id: string;
  email?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    full_name?: string;
  };
};
type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
};

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;

  // Actions
  signUp: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: AuthError }>;
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>;
  requestPasswordReset: (email: string) => Promise<{ error?: AuthError }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ error?: AuthError }>;

  // Internal actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      loading: true,

      // Actions
      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true });

          // Mock signup - simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if user already exists
          const existingUser = MOCK_USERS.find((u) => u.email === email);
          if (existingUser) {
            return { error: { message: "User already exists" } as AuthError };
          }

          // Create mock user
          const mockUser: User = {
            id: `mock-user-${Date.now()}`,
            email,
            user_metadata: {
              firstName: "New",
              lastName: "User",
              full_name: "New User",
            },
          };

          const mockSession: Session = {
            access_token: `mock-token-${Date.now()}`,
            refresh_token: `mock-refresh-${Date.now()}`,
            expires_in: 3600,
            user: mockUser,
          };

          set({ user: mockUser, session: mockSession });

          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });

          // Mock signin - simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check credentials
          const mockUser = MOCK_USERS.find(
            (u) => u.email === email && u.password === password,
          );

          if (!mockUser) {
            return {
              error: { message: "Invalid email or password" } as AuthError,
            };
          }

          // Create mock session
          const user: User = {
            id: mockUser.id,
            email: mockUser.email,
            user_metadata: {
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              full_name: `${mockUser.firstName} ${mockUser.lastName}`,
            },
          };

          const session: Session = {
            access_token: `mock-token-${Date.now()}`,
            refresh_token: `mock-refresh-${Date.now()}`,
            expires_in: 3600,
            user,
          };

          set({ user, session });

          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          set({ user: null, session: null });
          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      verifyOtp: async (email: string, token: string) => {
        try {
          set({ loading: true });

          // Mock OTP verification - simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock: accept any 6-digit OTP
          if (token.length === 6 && /^\d+$/.test(token)) {
            return { error: undefined };
          }

          return { error: { message: "Invalid OTP code" } as AuthError };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      resendConfirmation: async (email: string) => {
        try {
          // Mock resend confirmation - simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          console.log(`Mock: Confirmation email sent to ${email}`);
          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        }
      },

      requestPasswordReset: async (email: string) => {
        try {
          set({ loading: true });

          // Mock password reset request - simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if user exists (but don't use it for security)
          // Always return success for security reasons (don't leak user existence)
          console.log(`Mock: Password reset email sent to ${email}`);
          console.log(`Mock: Reset code is 123456`);
          
          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (email: string, code: string, newPassword: string) => {
        try {
          set({ loading: true });

          // Mock password reset - simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock: accept code 123456
          if (code !== "123456") {
            return { error: { message: "Invalid or expired reset code" } as AuthError };
          }

          // Check if user exists
          const userIndex = MOCK_USERS.findIndex((u) => u.email === email);
          if (userIndex === -1) {
            return { error: { message: "User not found" } as AuthError };
          }

          // Update password in mock users
          MOCK_USERS[userIndex].password = newPassword;
          
          console.log(`Mock: Password reset successfully for ${email}`);
          return { error: undefined };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // Internal actions
      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) =>
        set({ session, user: session?.user ?? null }),
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user and session, not loading state
      partialize: (state: AuthState) => ({
        user: state.user,
        session: state.session,
      }),
    },
  ),
);

// Selectors for performance
export const useUser = () => useAuthStore((state: AuthState) => state.user);
export const useSession = () =>
  useAuthStore((state: AuthState) => state.session);
export const useAuthLoading = () =>
  useAuthStore((state: AuthState) => state.loading);
export const useSignUp = () => useAuthStore((state: AuthState) => state.signUp);
export const useSignIn = () => useAuthStore((state: AuthState) => state.signIn);
export const useSignOut = () =>
  useAuthStore((state: AuthState) => state.signOut);
export const useVerifyOtp = () =>
  useAuthStore((state: AuthState) => state.verifyOtp);
export const useResendConfirmation = () =>
  useAuthStore((state: AuthState) => state.resendConfirmation);
export const useRequestPasswordReset = () =>
  useAuthStore((state: AuthState) => state.requestPasswordReset);
export const useResetPassword = () =>
  useAuthStore((state: AuthState) => state.resetPassword);

// Initialize auth state automatically
const initializeAuth = () => {
  // TODO: Implement your own auth initialization here
  // Get initial session
  // supabase.auth.getSession().then(({ data: { session } }) => {
  //   useAuthStore.setState({
  //     session,
  //     user: session?.user ?? null,
  //     loading: false,
  //   });
  // });

  // Listen for auth changes
  // const {
  //   data: { subscription },
  // } = supabase.auth.onAuthStateChange((_event, session) => {
  //   useAuthStore.setState({
  //     session,
  //     user: session?.user ?? null,
  //     loading: false,
  //   });
  // });

  // return () => subscription.unsubscribe();

  useAuthStore.setState({
    loading: false,
  });
};

// Auto-initialize when store is imported
initializeAuth();
