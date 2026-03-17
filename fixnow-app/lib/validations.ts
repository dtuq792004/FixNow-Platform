import { z } from "zod";

// ─── Sign In ──────────────────────────────────────────────────────────────────
export const signInSchema = z.object({
  emailAddress: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters"),
  emailAddress: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

// ─── Email Verification ───────────────────────────────────────────────────────
export const emailVerificationSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  emailAddress: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

// ─── Reset Password ───────────────────────────────────────────────────────────
// resetToken là chuỗi hex từ email link (không phải 6 số như OTP)
export const resetPasswordSchema = z
  .object({
    resetToken: z
      .string()
      .min(1, "Reset token is required")
      .min(10, "Reset token appears to be invalid"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Type exports ─────────────────────────────────────────────────────────────
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
