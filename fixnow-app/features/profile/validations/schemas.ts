import { z } from 'zod';

// ─── Personal info ────────────────────────────────────────────────────────────
export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự'),
  phone: z
    .string()
    .regex(/^0[0-9]{9}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)')
    .or(z.literal(''))
    .optional(),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

// ─── Address form ─────────────────────────────────────────────────────────────
export const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other'] as const),
  addressLine: z.string().min(5, 'Vui lòng nhập địa chỉ đường (ít nhất 5 ký tự)'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  city: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  isDefault: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
