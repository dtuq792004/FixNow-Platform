import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ProviderMenuItem } from '~/features/provider/components/provider-menu-item';

type Props = { onSignOut: () => void };

export function ProviderProfileMenu({ onSignOut }: Props) {
  const router = useRouter();

  return (
    <>
      {/* Main settings */}
      <View className="mx-4 rounded-2xl overflow-hidden border border-border mb-4">
        <ProviderMenuItem
          icon="user"
          label="Thông tin cá nhân"
          onPress={() => router.push('/profile/personal-info')}
        />
        <ProviderMenuItem
          icon="map-pin"
          label="Khu vực hoạt động"
          value="TP.HCM"
          onPress={() => {}}
        />
        <ProviderMenuItem
          icon="settings"
          label="Dịch vụ cung cấp"
          onPress={() => {}}
        />
        <ProviderMenuItem
          icon="star"
          label="Đánh giá & nhận xét"
          onPress={() => {}}
        />
      </View>

      {/* Support */}
      <View className="mx-4 rounded-2xl overflow-hidden border border-border mb-8">
        <ProviderMenuItem icon="help-circle" label="Hỗ trợ" onPress={() => {}} />
        <ProviderMenuItem icon="file-text" label="Điều khoản dịch vụ" onPress={() => {}} />
      </View>

      {/* Sign out */}
      <View className="px-4 pb-8">
        <Button
          variant="outline"
          size="lg"
          className="rounded-xl border-destructive"
          onPress={onSignOut}
        >
          <Feather name="log-out" size={16} color="#dc2626" style={{ marginRight: 8 }} />
          <Text className="text-destructive font-medium">Đăng xuất</Text>
        </Button>
      </View>
    </>
  );
}
