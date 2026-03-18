import type { ServiceCategoryType } from '~/features/home/types';

export type ProviderApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface ProviderApplication {
  id: string;
  status: ProviderApplicationStatus;
  submitted_at: string;
  reviewed_at?: string;
  fullName: string;
  phone: string;
  specialties: ServiceCategoryType[];
  experience: string;
  serviceArea: string;
  idCard: string;
  motivation?: string;
  rejectionReason?: string;
}

export interface ApplicationStatusConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const APPLICATION_STATUS_CONFIG: Record<ProviderApplicationStatus, ApplicationStatusConfig> = {
  pending: {
    label: 'Chờ xét duyệt',
    description: 'Đơn của bạn đã được ghi nhận, chúng tôi sẽ xem xét sớm nhất.',
    color: '#D97706',
    bgColor: '#FFFBEB',
    icon: 'clock',
  },
  under_review: {
    label: 'Đang xét duyệt',
    description: 'Đơn của bạn đang được đội ngũ xem xét kỹ lưỡng.',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    icon: 'search',
  },
  approved: {
    label: 'Đã được chấp thuận',
    description: 'Chúc mừng! Bạn đã trở thành thợ kỹ thuật trên FixNow.',
    color: '#059669',
    bgColor: '#ECFDF5',
    icon: 'check-circle',
  },
  rejected: {
    label: 'Không được chấp thuận',
    description: 'Đơn của bạn chưa đạt yêu cầu. Vui lòng xem lý do bên dưới.',
    color: '#DC2626',
    bgColor: '#FFF5F5',
    icon: 'x-circle',
  },
};
