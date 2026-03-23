import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressCard } from '~/features/profile/components/address-card';
import { AddressFormModal } from '~/features/profile/components/address-form-modal';
import { useAddresses } from '~/features/profile/hooks/use-addresses';
import type { SavedAddress } from '~/features/profile/types';
import type { AddressFormData } from '~/features/profile/validations/schemas';

const AddressesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addresses, isLoading, error, add, update, remove, setDefault, reload } = useAddresses();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => { setEditingAddress(null); setModalVisible(true); };
  const openEdit = (address: SavedAddress) => { setEditingAddress(address); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setEditingAddress(null); };

  const handleSave = async (data: AddressFormData, id?: string) => {
    try {
      setIsSaving(true);
      if (id) {
        await update(id, data);
      } else {
        await add(data);
      }
      closeModal();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message ?? 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message ?? 'Không thể xoá địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message ?? 'Không thể cập nhật địa chỉ mặc định.');
    }
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

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#18181b" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Feather name="wifi-off" size={32} color="#a1a1aa" style={{ marginBottom: 12 }} />
          <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 6 }}>
            Không thể tải địa chỉ
          </RNText>
          <RNText style={{ fontSize: 13, color: '#71717a', textAlign: 'center', marginBottom: 20 }}>
            {error}
          </RNText>
          <Pressable
            onPress={reload}
            style={{ backgroundColor: '#18181b', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <RNText style={{ color: '#fff', fontWeight: '700' }}>Thử lại</RNText>
          </Pressable>
        </View>
      ) : (
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
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))
          )}
        </ScrollView>
      )}

      <AddressFormModal
        visible={modalVisible}
        editing={editingAddress}
        onClose={closeModal}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </View>
  );
};

export default AddressesScreen;
