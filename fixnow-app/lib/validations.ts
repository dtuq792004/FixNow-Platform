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

// ─── OTP Verification ─────────────────────────────────────────────────────────
export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "Vui lòng nhập mã OTP")
    .length(6, "Mã OTP phải có đúng 6 chữ số")
    .regex(/^\d+$/, "Mã OTP chỉ gồm chữ số"),
});

// ─── Reset Password ───────────────────────────────────────────────────────────
// resetToken nhận tự động từ bước verify-otp, user chỉ nhập mật khẩu mới
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải có chữ hoa, chữ thường và số"
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// ─── Type exports ─────────────────────────────────────────────────────────────
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
