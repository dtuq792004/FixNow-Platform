import { Feather } from '@expo/vector-icons';
import { Alert, Pressable, Text as RNText, View } from 'react-native';
import { ADDRESS_LABEL_MAP, type SavedAddress } from '~/features/profile/types';

interface AddressCardProps {
  address: SavedAddress;
  onEdit: (address: SavedAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) => {
  const meta = ADDRESS_LABEL_MAP[address.label];

  const handleDelete = () => {
    Alert.alert('Xoá địa chỉ', 'Bạn có chắc muốn xoá địa chỉ này?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => onDelete(address.id) },
    ]);
  };

  return (
    <View style={{
      backgroundColor: '#fafafa', borderWidth: 1,
      borderColor: address.isDefault ? '#a3a3a3' : '#e4e4e7',
      borderRadius: 14, padding: 14, marginBottom: 12,
    }}>
      {/* Top row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 9,
          backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center', marginRight: 10,
        }}>
          <Feather name={meta.icon as never} size={15} color="#52525b" />
        </View>
        <RNText style={{ fontSize: 14, fontWeight: '700', color: '#18181b', flex: 1 }}>
          {meta.text}
        </RNText>
        {address.isDefault && (
          <View style={{
            paddingHorizontal: 8, paddingVertical: 3,
            backgroundColor: '#18181b', borderRadius: 20,
          }}>
            <RNText style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>Mặc định</RNText>
          </View>
        )}
      </View>

      {/* Address text */}
      <RNText style={{ fontSize: 13, color: '#52525b', marginLeft: 42, lineHeight: 18 }}>
        {address.addressLine},{'\n'}{address.ward}, {address.district}, {address.city}
      </RNText>

      {/* Action row */}
      <View style={{ flexDirection: 'row', marginTop: 12, marginLeft: 42, gap: 8 }}>
        {!address.isDefault && (
          <Pressable
            onPress={() => onSetDefault(address.id)}
            style={{
              paddingHorizontal: 10, paddingVertical: 5,
              borderWidth: 1, borderColor: '#e4e4e7',
              borderRadius: 8, backgroundColor: '#fff',
            }}
          >
            <RNText style={{ fontSize: 12, color: '#52525b', fontWeight: '500' }}>Đặt mặc định</RNText>
          </Pressable>
        )}
        <Pressable
          onPress={() => onEdit(address)}
          style={{
            paddingHorizontal: 10, paddingVertical: 5,
            borderWidth: 1, borderColor: '#e4e4e7',
            borderRadius: 8, backgroundColor: '#fff',
          }}
        >
          <RNText style={{ fontSize: 12, color: '#52525b', fontWeight: '500' }}>Sửa</RNText>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          style={{
            paddingHorizontal: 10, paddingVertical: 5,
            borderWidth: 1, borderColor: '#fecaca',
            borderRadius: 8, backgroundColor: '#fff5f5',
          }}
        >
          <RNText style={{ fontSize: 12, color: '#ef4444', fontWeight: '500' }}>Xoá</RNText>
        </Pressable>
      </View>
    </View>
  );
};
