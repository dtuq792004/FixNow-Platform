import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import type { ServiceItem } from '~/features/requests/services/request.service';

interface ServiceListItemProps {
  service: ServiceItem;
  isSelected: boolean;
  onPress: () => void;
}

const formatPrice = (price: number, unit: 'hour' | 'job') => {
  const formatted = price.toLocaleString('vi-VN');
  return unit === 'hour' ? `${formatted} ₫/giờ` : `${formatted} ₫`;
};

export const ServiceListItem = ({ service, isSelected, onPress }: ServiceListItemProps) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center p-3.5 rounded-2xl mb-2 border-[1.5px] active:opacity-85 ${isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white'
      }`}
  >
    {/* Icon */}
    <View
      className={`w-10 h-10 rounded-xl items-center justify-center mr-3.5 ${isSelected ? 'bg-zinc-900' : 'bg-zinc-100'
        }`}
    >
      <Feather name="tool" size={18} color={isSelected ? '#fff' : '#71717a'} />
    </View>

    {/* Text */}
    <View className="flex-1">
      <RNText
        className="text-sm font-semibold text-zinc-900 mb-[3px]"
        numberOfLines={2}
      >
        {service.name}
      </RNText>
      <RNText className="text-[13px] font-bold text-orange-500">
        {formatPrice(service.price, service.unit)}
      </RNText>
      {service.description ? (
        <RNText className="text-[12px] text-zinc-400 mt-0.5" numberOfLines={1}>
          {service.description}
        </RNText>
      ) : null}
    </View>

    {isSelected && (
      <Feather name="check-circle" size={20} color="#18181b" style={{ marginLeft: 8 }} />
    )}
  </Pressable>
);
