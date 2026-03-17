import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressCard } from '~/features/profile/components/address-card';
import { AddressFormModal } from '~/features/profile/components/address-form-modal';
import { useAddresses } from '~/features/profile/hooks/use-addresses';
import type { SavedAddress } from '~/features/profile/types';
import type { AddressFormData } from '~/features/profile/validations/schemas';

const AddressesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addresses, add, update, remove, setDefault } = useAddresses();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const openAdd = () => { setEditingAddress(null); setModalVisible(true); };
  const openEdit = (address: SavedAddress) => { setEditingAddress(address); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setEditingAddress(null); };

  const handleSave = (data: AddressFormData, id?: string) => {
    id ? update(id, data) : add(data);
    closeModal();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8, paddingBottom: 12,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <RNText style={{ fontSize: 17, fontWeight: '700', color: '#18181b', flex: 1 }}>
          Địa chỉ đã lưu
        </RNText>
        <Pressable
          onPress={openAdd}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            paddingHorizontal: 10, paddingVertical: 6,
            backgroundColor: '#18181b', borderRadius: 10,
          }}
        >
          <Feather name="plus" size={14} color="#fff" />
          <RNText style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>Thêm</RNText>
        </Pressable>
      </View>

      {/* Address list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <View style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}>
              <Feather name="map-pin" size={24} color="#a1a1aa" />
            </View>
            <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 6 }}>
              Chưa có địa chỉ nào
            </RNText>
            <RNText style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginBottom: 20 }}>
              Thêm địa chỉ để đặt yêu cầu nhanh hơn
            </RNText>
            <Pressable
              onPress={openAdd}
              style={{ backgroundColor: '#18181b', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
            >
              <RNText style={{ color: '#fff', fontWeight: '700' }}>+ Thêm địa chỉ</RNText>
            </Pressable>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
              onDelete={remove}
              onSetDefault={setDefault}
            />
          ))
        )}
      </ScrollView>

      <AddressFormModal
        visible={modalVisible}
        editing={editingAddress}
        onClose={closeModal}
        onSave={handleSave}
      />
    </View>
  );
};

export default AddressesScreen;
