import { Feather } from '@expo/vector-icons';
import { Text as RNText, View } from 'react-native';
import { getRelativeTime } from '~/features/home/utils/format-time';
import type { RequestTimelineEvent } from '~/features/requests/types';

interface StatusTimelineProps {
  events: RequestTimelineEvent[];
}

const ICON_MAP: Record<string, string> = {
  created: 'check-circle',
  assigned: 'user-check',
  in_progress: 'tool',
  completed: 'check-circle',
  cancelled: 'x-circle',
};

export const StatusTimeline = ({ events }: StatusTimelineProps) => (
  <View>
    {events.map((event, index) => {
      const isLast = index === events.length - 1;
      const icon = ICON_MAP[event.status] ?? 'circle';

      return (
        <View key={event.status} style={{ flexDirection: 'row' }}>
          {/* Left: dot + line */}
          <View style={{ alignItems: 'center', width: 28, marginRight: 14 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: event.isReached ? '#18181b' : '#e4e4e7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather
                name={icon as never}
                size={13}
                color={event.isReached ? '#ffffff' : '#a1a1aa'}
              />
            </View>
            {!isLast && (
              <View
                style={{
                  width: 2,
                  flex: 1,
                  minHeight: 24,
                  backgroundColor: event.isReached ? '#18181b' : '#e4e4e7',
                  marginTop: 2,
                  marginBottom: 2,
                }}
              />
            )}
          </View>

          {/* Right: text */}
          <View style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
            <RNText
              style={{
                fontSize: 14,
                fontWeight: event.isReached ? '600' : '400',
                color: event.isReached ? '#18181b' : '#a1a1aa',
                marginBottom: 2,
              }}
            >
              {event.label}
            </RNText>
            <RNText style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 16 }}>
              {event.timestamp ? getRelativeTime(event.timestamp) : event.description}
            </RNText>
          </View>
        </View>
      );
    })}
  </View>
);
