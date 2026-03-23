import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text as RNText, TextInput, View } from 'react-native';
import type { SavedAddress } from '~/features/profile/types';
import { AddressPickerModal } from './address-picker-modal';
import { formatSavedAddress } from '../utils/address-format.utils';

export interface AddressPickerProps {
  value: string;
  addressId?: string;
  onAddressChange: (text: string, id?: string) => void;
  error?: string;
}

export const AddressPicker = ({ value, addressId, onAddressChange, error }: AddressPickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const handleSelect = (address: SavedAddress) => {
    onAddressChange(formatSavedAddress(address), address.id);
    setModalVisible(false);
    setManualMode(false);
  };

  const handleManual = () => {
    setModalVisible(false);
    setManualMode(true);
    onAddressChange('', undefined);
  };

  const hasValue = value.trim().length > 0;
  const isFromSaved = !!addressId && hasValue;

  return (
    <View>
      {manualMode ? (
        /* ── Manual text input ── */
        <View>
          <TextInput
            value={value}
            onChangeText={(text) => onAddressChange(text, undefined)}
            placeholder='Vd: "123 Nguyễn Trãi, P.2, Q.5, TP.HCM"'
            placeholderTextColor="#a1a1aa"
            className="h-12 rounded-lg border px-3 text-[15px] text-zinc-900 bg-white"
            style={{ borderColor: error ? '#ef4444' : '#e4e4e7' }}
            returnKeyType="next"
            autoFocus
          />
          <Pressable
            onPress={() => setModalVisible(true)}
            className="mt-1.5 flex-row items-center"
          >
            <Feather name="list" size={13} color="#f97316" style={{ marginRight: 4 }} />
            <RNText className="text-xs text-orange-500 font-semibold">
              Chọn từ địa chỉ đã lưu
            </RNText>
          </Pressable>
        </View>
      ) : (
        /* ── Picker trigger ── */
        <Pressable
          onPress={() => setModalVisible(true)}
          className={`flex-row items-center min-h-[48px] rounded-lg border px-3 py-2.5 active:opacity-80 ${
            error
              ? 'border-red-500'
              : isFromSaved
              ? 'border-zinc-900'
              : 'border-zinc-200'
          } ${isFromSaved ? 'bg-zinc-50' : 'bg-white'}`}
        >
          <Feather
            name={isFromSaved ? 'map-pin' : 'search'}
            size={15}
            color={isFromSaved ? '#18181b' : '#a1a1aa'}
            style={{ marginRight: 8 }}
          />
          <RNText
            className={`flex-1 text-[15px] leading-5 ${hasValue ? 'text-zinc-900' : 'text-zinc-400'}`}
            numberOfLines={2}
          >
            {hasValue ? value : 'Chọn hoặc nhập địa chỉ...'}
          </RNText>
          <Feather name="chevron-down" size={16} color="#a1a1aa" style={{ marginLeft: 4 }} />
        </Pressable>
      )}

      <AddressPickerModal
        visible={modalVisible}
        selectedId={addressId}
        onSelect={handleSelect}
        onManual={handleManual}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};
