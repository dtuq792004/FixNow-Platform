import { z } from 'zod';

const CATEGORY_VALUES = [
  'electrical',
  'plumbing',
  'hvac',
  'appliance',
  'security',
  'painting',
  'other',
] as const;

export const createRequestSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
  title: z
    .string()
    .min(1, 'Vui lòng nhập tiêu đề yêu cầu')
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(100, 'Tiêu đề không được quá 100 ký tự'),
  description: z
    .string()
    .min(1, 'Vui lòng mô tả vấn đề')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự'),
  address: z
    .string()
    .min(1, 'Vui lòng nhập địa chỉ')
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  addressId: z.string().optional(), // MongoDB _id of saved address (when picked from list)
  note: z.string().max(200, 'Ghi chú không được quá 200 ký tự').optional(),
});

export type CreateRequestSchema = z.infer<typeof createRequestSchema>;

/** Fields validated at each step before advancing */
export const STEP_FIELDS = {
  1: ['category'] as const,
  2: ['title', 'description', 'address'] as const,
  3: [] as const,
} satisfies Record<number, readonly (keyof CreateRequestSchema)[]>;
