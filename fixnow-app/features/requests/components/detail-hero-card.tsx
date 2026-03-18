import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import { RequestStatusBadge } from '~/features/home/components/request-status-badge';
import { getCategoryConfig } from '~/features/home/data/service-categories';
import type { ServiceRequestDetail } from '~/features/requests/types';

interface DetailHeroCardProps {
  category: ServiceRequestDetail['category'];
  status: ServiceRequestDetail['status'];
}

/** Top card showing category icon + label + current status badge */
export const DetailHeroCard = ({ category: categoryType, status }: DetailHeroCardProps) => {
  const category = getCategoryConfig(categoryType);
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7',
      borderRadius: 16, padding: 16, marginBottom: 24,
    }}>
      <View
        className={category.bgClass}
        style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}
      >
        <Feather name={category.icon as never} size={22} color={category.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 2 }}>Loại dịch vụ</RNText>
        <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b' }}>{category.label}</RNText>
      </View>
      <RequestStatusBadge status={status} />
    </View>
  );
};
