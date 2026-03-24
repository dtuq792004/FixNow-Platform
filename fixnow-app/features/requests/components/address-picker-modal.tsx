import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchAddresses } from '~/features/profile/services/address.service';
import type { SavedAddress } from '~/features/profile/types';
import { AddressListItem } from './address-list-item';

export interface AddressPickerModalProps {
  visible: boolean;
  selectedId?: string;
  onSelect: (address: SavedAddress) => void;
  onManual: () => void;
  onClose: () => void;
}

export const AddressPickerModal = ({
  visible, selectedId, onSelect, onManual, onClose,
}: AddressPickerModalProps) => {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(null);
    fetchAddresses()
      .then(setAddresses)
      .catch((e) => setError(e?.message ?? 'Không thể tải địa chỉ'))
      .finally(() => setLoading(false));
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      {/* Sheet */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80%]"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-9 h-1 rounded-full bg-zinc-200" />
        </View>

        {/* Header */}
        <View className="flex-row items-center px-5 py-3.5 border-b border-zinc-100">
          <RNText className="flex-1 text-[17px] font-bold text-zinc-900">Chọn địa chỉ</RNText>
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

        ) : addresses.length === 0 ? (
          <View className="p-7 items-center">
            <Feather name="map-pin" size={32} color="#d4d4d8" style={{ marginBottom: 12 }} />
            <RNText className="text-[15px] font-semibold text-zinc-900 mb-1.5 text-center">
              Chưa có địa chỉ nào
            </RNText>
            <RNText className="text-[13px] text-zinc-500 text-center mb-5">
              Thêm địa chỉ trong Hồ sơ để chọn nhanh hơn
            </RNText>
            <Pressable
              onPress={onManual}
              className="border-[1.5px] border-zinc-900 rounded-xl px-5 py-2.5 active:opacity-70"
            >
              <RNText className="text-sm font-semibold text-zinc-900">Nhập địa chỉ thủ công</RNText>
            </Pressable>
          </View>

        ) : (
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
            renderItem={({ item }) => (
              <AddressListItem
                address={item}
                isSelected={item.id === selectedId}
                onPress={() => onSelect(item)}
              />
            )}
            ListFooterComponent={
              <Pressable
                onPress={onManual}
                className="flex-row items-center justify-center py-3.5 rounded-2xl border-[1.5px] border-dashed border-zinc-200 mt-1 active:opacity-70"
              >
                <Feather name="edit-3" size={15} color="#71717a" style={{ marginRight: 8 }} />
                <RNText className="text-sm font-semibold text-zinc-500">Nhập địa chỉ thủ công</RNText>
              </Pressable>
            }
          />
        )}
      </View>
    </Modal>
  );
};
