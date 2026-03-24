import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import type { SavedAddress } from '~/features/profile/types';
import { ADDRESS_LABEL_MAP } from '~/features/profile/types';
import { formatSavedAddress } from '../utils/address-format.utils';

interface AddressListItemProps {
  address: SavedAddress;
  isSelected: boolean;
  onPress: () => void;
}

export const AddressListItem = ({ address, isSelected, onPress }: AddressListItemProps) => {
  const labelInfo = ADDRESS_LABEL_MAP[address.label];
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-3.5 rounded-2xl mb-2 border-[1.5px] active:opacity-85 ${
        isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white'
      }`}
    >
      {/* Label icon */}
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3.5 ${
          isSelected ? 'bg-zinc-900' : 'bg-zinc-100'
        }`}
      >
        <Feather name={labelInfo.icon as never} size={18} color={isSelected ? '#fff' : '#71717a'} />
      </View>

      {/* Text */}
      <View className="flex-1">
        <View className="flex-row items-center mb-[3px]">
          <RNText className="text-sm font-semibold text-zinc-900 mr-1.5">{labelInfo.text}</RNText>
          {address.isDefault && (
            <View className="bg-orange-500 rounded-md px-1.5 py-px">
              <RNText className="text-[10px] font-bold text-white">Mặc định</RNText>
            </View>
          )}
        </View>
        <RNText className="text-[13px] text-zinc-500 leading-[18px]">
          {formatSavedAddress(address)}
        </RNText>
      </View>

      {isSelected && (
        <Feather name="check-circle" size={20} color="#18181b" style={{ marginLeft: 8 }} />
      )}
    </Pressable>
  );
};
