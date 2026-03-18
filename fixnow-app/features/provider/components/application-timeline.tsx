import { Feather } from '@expo/vector-icons';
import { Text as RNText, View } from 'react-native';
import type { ProviderApplicationStatus } from '~/features/provider/types';

interface TimelineStep {
  key: string;
  label: string;
  description: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'submitted',    label: 'Đã tiếp nhận đơn',  description: 'Hệ thống đã ghi nhận đơn đăng ký' },
  { key: 'under_review', label: 'Đang xét duyệt',     description: 'Đội ngũ đang xem xét hồ sơ của bạn' },
  { key: 'result',       label: 'Kết quả',             description: 'Thông báo kết quả xét duyệt' },
];

const STATUS_REACHED_MAP: Record<ProviderApplicationStatus, number> = {
  pending:      0,
  under_review: 1,
  approved:     2,
  rejected:     2,
};

interface ApplicationTimelineProps {
  status: ProviderApplicationStatus;
  submittedAt: string;
}

export const ApplicationTimeline = ({ status, submittedAt }: ApplicationTimelineProps) => {
  const reachedIndex = STATUS_REACHED_MAP[status];
  const isRejected = status === 'rejected';

  return (
    <View>
      {TIMELINE_STEPS.map((step, index) => {
        const isReached = index <= reachedIndex;
        const isCurrent = index === reachedIndex;
        const isLast = index === TIMELINE_STEPS.length - 1;
        const isResultRejected = isLast && isRejected;

        const dotColor = isResultRejected
          ? '#EF4444'
          : isReached ? '#18181b' : '#D4D4D8';

        return (
          <View key={step.key} style={{ flexDirection: 'row' }}>
            {/* Left: dot + line */}
            <View style={{ width: 28, alignItems: 'center' }}>
              {/* Dot */}
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: isReached ? dotColor : '#fff',
                borderWidth: 2, borderColor: isReached ? dotColor : '#D4D4D8',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 1,
              }}>
                {isReached && !isCurrent && (
                  <Feather
                    name={isResultRejected ? 'x' : 'check'}
                    size={11}
                    color="#fff"
                  />
                )}
                {isCurrent && !isLast && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
                )}
              </View>
              {/* Connector line */}
              {!isLast && (
                <View style={{
                  width: 2, flex: 1, marginTop: 2, marginBottom: 2,
                  backgroundColor: index < reachedIndex ? '#18181b' : '#E4E4E7',
                }} />
              )}
            </View>

            {/* Right: text */}
            <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 20 }}>
              <RNText style={{
                fontSize: 14, fontWeight: isCurrent ? '700' : '500',
                color: isReached ? '#18181b' : '#A1A1AA',
                marginBottom: 2,
              }}>
                {step.label}
              </RNText>
              <RNText style={{ fontSize: 12, color: isReached ? '#71717A' : '#D4D4D8', lineHeight: 17 }}>
                {step.description}
              </RNText>
              {index === 0 && (
                <RNText style={{ fontSize: 11, color: '#A1A1AA', marginTop: 3 }}>
                  {new Date(submittedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </RNText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
