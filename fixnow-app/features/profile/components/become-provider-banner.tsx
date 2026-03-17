import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';
import { useProviderApplication } from '~/features/provider/hooks/use-provider-application';
import { APPLICATION_STATUS_CONFIG } from '~/features/provider/types';

/** CTA banner prompting the customer to register as a provider.
 *  - No application  → navigates to registration form
 *  - Has application → navigates to status screen (text reflects current status)
 */
export const BecomeProviderBanner = () => {
  const router = useRouter();
  const { application } = useProviderApplication();

  const hasApplication = !!application;

  const handlePress = () => {
    if (hasApplication) {
      router.push('/become-provider/status');
    } else {
      router.push('/become-provider/register');
    }
  };

  // When application exists, show status-aware subtitle
  const subtitle = hasApplication
    ? APPLICATION_STATUS_CONFIG[application.status].label
    : 'Nhận việc, kiếm thêm thu nhập cùng FixNow';

  const title = hasApplication ? 'Đơn đăng ký thợ kỹ thuật' : 'Trở thành thợ kỹ thuật';

  // Status dot color (only shown when has application)
  const statusColor = hasApplication
    ? APPLICATION_STATUS_CONFIG[application.status].color
    : null;

  return (
    <Pressable
      onPress={handlePress}
      style={{
        marginHorizontal: 16, marginBottom: 20,
        backgroundColor: '#18181b', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center',
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {/* Icon */}
      <View style={{
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
      }}>
        <Feather
          name={hasApplication ? 'clipboard' : 'briefcase'}
          size={20}
          color="#ffffff"
        />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 3 }}>
          {title}
        </RNText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          {statusColor && (
            <View style={{
              width: 7, height: 7, borderRadius: 3.5,
              backgroundColor: statusColor,
            }} />
          )}
          <RNText style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 17 }}>
            {subtitle}
          </RNText>
        </View>
      </View>

      <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.5)" />
    </Pressable>
  );
};
