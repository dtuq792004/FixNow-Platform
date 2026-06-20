import { z } from 'zod'

export const loginSchema = z.object({
  identity: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  remember: z.boolean(),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên'),
  phone: z.string().regex(/^(0|\+84)\d{9}$/, 'Số điện thoại không hợp lệ'),
  email: z.email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  terms: z.boolean().refine((value) => value, 'Bạn cần đồng ý với điều khoản'),
})

export const forgotPasswordSchema = z.object({
  email: z.email('Email không hợp lệ'),
})

export const otpSchema = z.object({
  otp: z.string().length(6, 'Vui lòng nhập đủ 6 chữ số').regex(/^\d+$/, 'Mã OTP chỉ gồm chữ số'),
})

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
