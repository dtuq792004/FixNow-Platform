import type { HomeStats, ServiceRequest } from '../types';

export const MOCK_HOME_STATS: HomeStats = {
  pending: 1,
  in_progress: 2,
  completed: 8,
  total: 11,
};

export const MOCK_RECENT_REQUESTS: ServiceRequest[] = [
  {
    id: '1',
    title: 'Sửa điện phòng khách',
    description: 'Đèn phòng khách bị chập, cần thay dây điện và bóng đèn.',
    category: 'electrical',
    status: 'in_progress',
    address: '123 Nguyễn Trãi, Q.1, TP.HCM',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'p1',
      name: 'Nguyễn Văn Thắng',
      rating: 4.8,
    },
  },
  {
    id: '2',
    title: 'Thông tắc ống nước nhà tắm',
    description: 'Ống nước nhà tắm bị tắc, nước chảy rất chậm.',
    category: 'plumbing',
    status: 'pending',
    address: '123 Nguyễn Trãi, Q.1, TP.HCM',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Vệ sinh máy lạnh 2 cục',
    description: 'Máy lạnh chạy yếu, cần vệ sinh định kỳ.',
    category: 'hvac',
    status: 'completed',
    address: '123 Nguyễn Trãi, Q.1, TP.HCM',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'p2',
      name: 'Trần Minh Tuấn',
      rating: 4.9,
    },
  },
];
