import { Feather } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

const BRAND = '#F97316';

type Props = {
  onSignIn: () => void;
};

export function ForgotSuccessStep({ onSignIn }: Props) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      contentContainerStyle={{ padding: 28, paddingBottom: 48 }}
    >
      {/* Success icon */}
      <View className="items-center mt-4 mb-8">
        <View
          style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#f0fdf4',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Feather name="check-circle" size={40} color="#22c55e" />
        </View>

        <Text className="text-2xl font-bold text-foreground mb-3 text-center">
          Đặt lại thành công!
        </Text>
        <Text className="text-muted-foreground text-sm text-center leading-6">
          Mật khẩu của bạn đã được cập nhật.{'\n'}
          Đăng nhập với mật khẩu mới để tiếp tục.
        </Text>
      </View>

      <Button variant="brand" size="lg" className="rounded-xl" onPress={onSignIn}>
        <Text className="font-semibold text-white text-base">Đăng nhập ngay</Text>
      </Button>
    </ScrollView>
  );
}
