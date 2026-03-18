import { Feather } from '@expo/vector-icons';
import { Text as RNText, View } from 'react-native';
import type { ProviderApplicationStatus } from '~/features/provider/types';
import { APPLICATION_STATUS_CONFIG } from '~/features/provider/types';

interface ApplicationStatusCardProps {
  status: ProviderApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export const ApplicationStatusCard = ({
  status,
  submittedAt,
  reviewedAt,
}: ApplicationStatusCardProps) => {
  const config = APPLICATION_STATUS_CONFIG[status];
  const submittedDate = new Date(submittedAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <View style={{
      backgroundColor: config.bgColor, borderRadius: 16,
      padding: 20, marginBottom: 24, alignItems: 'center',
      borderWidth: 1, borderColor: config.color + '30',
    }}>
      {/* Icon circle */}
      <View style={{
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: config.color + '20',
        alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <Feather name={config.icon as never} size={28} color={config.color} />
      </View>

      {/* Status label */}
      <RNText style={{ fontSize: 18, fontWeight: '800', color: config.color, marginBottom: 6 }}>
        {config.label}
      </RNText>

      {/* Description */}
      <RNText style={{
        fontSize: 13, color: '#52525b', textAlign: 'center',
        lineHeight: 19, marginBottom: 14,
      }}>
        {config.description}
      </RNText>

      {/* Meta info */}
      <View style={{
        flexDirection: 'row', gap: 16,
        paddingTop: 14, borderTopWidth: 1, borderTopColor: config.color + '20',
        width: '100%', justifyContent: 'center',
      }}>
        <View style={{ alignItems: 'center' }}>
          <RNText style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 2 }}>Ngày nộp</RNText>
          <RNText style={{ fontSize: 13, fontWeight: '700', color: '#18181b' }}>
            {submittedDate}
          </RNText>
        </View>
        {reviewedAt && (
          <>
            <View style={{ width: 1, backgroundColor: '#e4e4e7' }} />
            <View style={{ alignItems: 'center' }}>
              <RNText style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 2 }}>Ngày duyệt</RNText>
              <RNText style={{ fontSize: 13, fontWeight: '700', color: '#18181b' }}>
                {new Date(reviewedAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              </RNText>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
