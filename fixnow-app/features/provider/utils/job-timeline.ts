import type { ProviderJobDetail, ProviderJobStatus } from '../types/job.types';
import type { RequestTimelineEvent } from '~/features/requests/types';

const reached = (job: ProviderJobDetail, statuses: ProviderJobStatus[]) =>
  statuses.includes(job.status);

export const buildProviderTimeline = (job: ProviderJobDetail): RequestTimelineEvent[] => {
  if (job.status === 'CANCELLED') {
    return [
      {
        status: 'created',
        label: 'Đơn mới',
        description: 'Yêu cầu được đăng bởi khách',
        timestamp: job.createdAt,
        isReached: true,
      },
      {
        status: 'cancelled' as any,
        label: 'Đã hủy',
        description: 'Yêu cầu bị hủy',
        timestamp: null,
        isReached: true,
      },
    ];
  }

  return [
    {
      status: 'created',
      label: 'Đơn mới',
      description: 'Yêu cầu được đăng bởi khách',
      timestamp: job.createdAt,
      isReached: true,
    },
    {
      status: 'assigned',
      label: 'Đã nhận việc',
      description: 'Bạn chấp nhận yêu cầu',
      timestamp: reached(job, ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']) ? job.createdAt : null,
      isReached: reached(job, ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']),
    },
    {
      status: 'in_progress',
      label: 'Đang thực hiện',
      description: 'Công việc đang được xử lý',
      timestamp: null,
      isReached: reached(job, ['IN_PROGRESS', 'COMPLETED']),
    },
    {
      status: 'completed',
      label: 'Hoàn thành',
      description: 'Công việc đã hoàn tất',
      timestamp: job.completedAt ?? null,
      isReached: reached(job, ['COMPLETED']),
    },
  ];
};
