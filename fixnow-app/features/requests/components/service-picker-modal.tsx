import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text as RNText,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  fetchServicesByCategoryApi,
  type ServiceItem,
} from '~/features/requests/services/request.service';
import { ServiceListItem } from './service-list-item';

interface ServicePickerModalProps {
  visible: boolean;
  categoryId: string;
  selectedId?: string;
  onSelect: (service: ServiceItem) => void;
  onClose: () => void;
}

export const ServicePickerModal = ({
  visible,
  categoryId,
  selectedId,
  onSelect,
  onClose,
}: ServicePickerModalProps) => {
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !categoryId) return;
    setLoading(true);
    setError(null);
    fetchServicesByCategoryApi(categoryId)
      .then(setServices)
      .catch((err) => {
        console.error('[ServicePickerModal] fetch failed:', err);
        setError(err?.message ?? 'Không thể tải danh sách dịch vụ');
      })
      .finally(() => setLoading(false));
  }, [visible, categoryId]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      {/* Bottom sheet */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
        style={{ maxHeight: '75%', paddingBottom: insets.bottom + 16 }}
      >
        {/* Handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-9 h-1 rounded-full bg-zinc-200" />
        </View>

        {/* Header */}
        <View className="flex-row items-center px-5 py-3.5 border-b border-zinc-100">
          <RNText className="flex-1 text-[17px] font-bold text-zinc-900">
            Chọn dịch vụ
          </RNText>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={20} color="#71717a" />
          </Pressable>
        </View>

        {/* Body */}
        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#18181b" />
          </View>
        ) : error ? (
          <View className="p-6 items-center">
            <Feather name="wifi-off" size={28} color="#a1a1aa" style={{ marginBottom: 8 }} />
            <RNText className="text-zinc-500 text-center text-[13px]">{error}</RNText>
          </View>
        ) : services.length === 0 ? (
          <View className="p-7 items-center">
            <Feather name="tool" size={32} color="#d4d4d8" style={{ marginBottom: 12 }} />
            <RNText className="text-[15px] font-semibold text-zinc-900 mb-1.5 text-center">
              Chưa có dịch vụ nào
            </RNText>
            <RNText className="text-[13px] text-zinc-500 text-center">
              Danh mục này chưa có dịch vụ được duyệt
            </RNText>
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ServiceListItem
                service={item}
                isSelected={item.id === selectedId}
                onPress={() => onSelect(item)}
              />
            )}
          />
        )}
      </View>
    </Modal>
  );
};
