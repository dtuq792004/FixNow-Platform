import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import { SERVICE_CATEGORIES, OTHER_CATEGORY } from '~/features/home/data/service-categories';
import type { ServiceCategoryType } from '~/features/home/types';
import type { ServiceItem } from '~/features/requests/services/request.service';
import { ServicePickerModal } from './service-picker-modal';

interface ServicePickerProps {
  category: ServiceCategoryType;
  selectedServiceId?: string;
  selectedServiceName?: string;
  onSelect: (service: ServiceItem | null) => void;
}

const ALL_CATEGORIES = [...SERVICE_CATEGORIES, OTHER_CATEGORY];

const formatPrice = (price: number, unit: 'hour' | 'job') => {
  const formatted = price.toLocaleString('vi-VN');
  return unit === 'hour' ? `${formatted} ₫/giờ` : `${formatted} ₫`;
};

export const ServicePicker = ({
  category,
  selectedServiceId,
  selectedServiceName,
  onSelect,
}: ServicePickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const categoryConfig = ALL_CATEGORIES.find((c) => c.type === category);
  const categoryId = categoryConfig?._id ?? '';

  const hasSelected = !!selectedServiceId && !!selectedServiceName;

  const handleSelect = (svc: ServiceItem) => {
    // toggle: bấm lại item đang chọn → bỏ chọn
    if (svc.id === selectedServiceId) {
      onSelect(null);
    } else {
      onSelect(svc);
    }
    setModalVisible(false);
  };

  return (
    <View>
      {/* ── Trigger button (same style as AddressPicker) ── */}
      <Pressable
        onPress={() => setModalVisible(true)}
        className={`flex-row items-center min-h-[48px] rounded-lg border px-3 py-2.5 active:opacity-80 ${hasSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white'
          }`}
      >
        <Feather
          name={hasSelected ? 'tool' : 'search'}
          size={15}
          color={hasSelected ? '#18181b' : '#a1a1aa'}
          style={{ marginRight: 8 }}
        />
        <RNText
          className={`flex-1 text-[15px] leading-5 ${hasSelected ? 'text-zinc-900' : 'text-zinc-400'}`}
          numberOfLines={1}
        >
          {hasSelected ? selectedServiceName : 'Chọn dịch vụ...'}
        </RNText>
        {hasSelected && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            hitSlop={8}
          >
            <Feather name="x-circle" size={16} color="#a1a1aa" style={{ marginRight: 4 }} />
          </Pressable>
        )}
        <Feather name="chevron-down" size={16} color="#a1a1aa" style={{ marginLeft: hasSelected ? 0 : 4 }} />
      </Pressable>

      {/* ── Modal ── */}
      <ServicePickerModal
        visible={modalVisible}
        categoryId={categoryId}
        selectedId={selectedServiceId}
        onSelect={handleSelect}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};
