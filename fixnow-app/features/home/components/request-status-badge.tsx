import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { RequestStatus } from '~/features/home/types';

interface StatusConfig {
  label: string;
  bgClass: string;
  dotClass: string;
  textClass: string;
}

const STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  pending: {
    label: 'Chờ xác nhận',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-700',
  },
  assigned: {
    label: 'Đã giao thợ',
    bgClass: 'bg-blue-50',
    dotClass: 'bg-blue-400',
    textClass: 'text-blue-700',
  },
  in_progress: {
    label: 'Đang thực hiện',
    bgClass: 'bg-indigo-50',
    dotClass: 'bg-indigo-400',
    textClass: 'text-indigo-700',
  },
  completed: {
    label: 'Hoàn thành',
    bgClass: 'bg-green-50',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700',
  },
  cancelled: {
    label: 'Đã hủy',
    bgClass: 'bg-red-50',
    dotClass: 'bg-red-400',
    textClass: 'text-red-700',
  },
};

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

export const RequestStatusBadge = ({ status }: RequestStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <View className={`flex-row items-center rounded-full px-2.5 py-1 ${config.bgClass}`}>
      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dotClass}`} />
      <Text className={`text-xs font-medium ${config.textClass}`}>{config.label}</Text>
    </View>
  );
};

export { STATUS_CONFIG };
