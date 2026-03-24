import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';
import { Text as CustomText } from '~/components/ui/text';

export interface PaymentAction {
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'brand';
  onPress: () => void;
  className?: string;
}

export interface PaymentResultViewProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  iconBorderColor: string;
  title: string;
  subtitle: string;
  requestId?: string;
  customChips?: React.ReactNode;
  actions: PaymentAction[];
}

export const PaymentResultView = ({
  icon,
  iconColor,
  iconBg,
  iconBorderColor,
  title,
  subtitle,
  requestId,
  customChips,
  actions,
}: PaymentResultViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: iconBg, borderColor: iconBorderColor }]}>
        <Feather name={icon as any} size={44} color={iconColor} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.subtitle, { marginBottom: customChips ? 16 : 36 }]}>{subtitle}</Text>

      {/* Custom Chips (like "Thanh toán khi hoàn thành") */}
      {customChips && <View style={styles.chipRow}>{customChips}</View>}

      {/* Request ID chip */}
      {requestId && (
        <View style={styles.idChip}>
          <Text style={styles.idLabel}>
            Mã yêu cầu:{' '}
            <Text style={[styles.idValue, { color: iconColor === '#16a34a' ? '#15803d' : '#18181b' }]}>
              {requestId.slice(-8).toUpperCase()}
            </Text>
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant ?? 'brand'}
            className={action.className ?? `w-full rounded-xl native:h-14 ${index < actions.length - 1 ? 'mb-3' : ''}`}
            onPress={action.onPress}
          >
            {action.icon && <Feather name={action.icon as any} size={16} color={action.variant === 'outline' ? '#18181b' : '#ffffff'} />}
            <CustomText className={`${action.icon ? 'ml-2' : ''} ${action.variant === 'outline' ? 'font-medium text-zinc-900' : 'font-semibold text-white'} native:text-base`}>
              {action.label}
            </CustomText>
          </Button>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#18181b',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    width: '100%',
  },
  idChip: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 36,
  },
  idLabel: {
    fontSize: 13,
    color: '#71717a',
  },
  idValue: {
    fontWeight: '700',
  },
  actions: {
    width: '100%',
  },
});
