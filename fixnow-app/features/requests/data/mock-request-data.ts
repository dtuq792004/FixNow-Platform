import type { CreateRequestSchema } from '../validations/create-request.schema';

/**
 * Pre-filled form values for UI testing.
 * Remove or replace with `undefined` defaultValues when backend is ready.
 */
export const MOCK_CREATE_REQUEST: CreateRequestSchema = {
  category: 'electrical',
  title: 'Đèn phòng khách bị chập, không bật được',
  description:
    'Đèn phòng khách đột ngột tắt từ hôm qua. Bật công tắc có mùi khét nhẹ, nghi bị chập dây hoặc hỏng bóng. Cần kiểm tra và thay thế nếu cần.',
  address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh',
  note: 'Có thể hỗ trợ buổi sáng hoặc chiều, ưu tiên sớm nhất trong ngày.',
};
