import { z } from 'zod';

export const registerProviderSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Họ và tên không được để trống'),
  phone: z
    .string()
    .min(10, 'Số điện thoại không hợp lệ'),
  specialties: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất 1 chuyên môn'),
  experience: z
    .string()
    .min(5, 'Vui lòng mô tả kinh nghiệm (ít nhất 5 ký tự)')
    .max(300, 'Tối đa 300 ký tự'),
  serviceArea: z
    .string()
    .min(3, 'Vui lòng nhập khu vực hoạt động'),
  idCard: z
    .string()
    .regex(/^(\d{9}|\d{12})$/, 'Số CCCD/CMND phải có 9 hoặc 12 chữ số'),
  motivation: z.string().max(300).optional(),
});

export type RegisterProviderFormData = z.infer<typeof registerProviderSchema>;
