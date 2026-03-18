import { Feather } from '@expo/vector-icons';
import { Text as RNText, View } from 'react-native';

interface Stat {
  icon: string;
  value: number;
  label: string;
  color: string;
}

interface ProfileStatsRowProps {
  total: number;
  active: number;
  completed: number;
}

export const ProfileStatsRow = ({ total, active, completed }: ProfileStatsRowProps) => {
  const stats: Stat[] = [
    { icon: 'clipboard', value: total, label: 'Tổng YC', color: '#6366f1' },
    { icon: 'tool', value: active, label: 'Đang xử lý', color: '#f59e0b' },
    { icon: 'check-circle', value: completed, label: 'Hoàn thành', color: '#22c55e' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7',
      borderRadius: 16, marginHorizontal: 16, marginBottom: 20,
    }}>
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          style={{
            flex: 1, alignItems: 'center', paddingVertical: 16,
            borderRightWidth: index < stats.length - 1 ? 1 : 0,
            borderRightColor: '#e4e4e7',
          }}
        >
          <View style={{
            width: 32, height: 32, borderRadius: 10,
            backgroundColor: stat.color + '18',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 6,
          }}>
            <Feather name={stat.icon as never} size={15} color={stat.color} />
          </View>
          <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b', lineHeight: 24 }}>
            {stat.value}
          </RNText>
          <RNText style={{ fontSize: 11, color: '#71717a', marginTop: 2, textAlign: 'center' }}>
            {stat.label}
          </RNText>
        </View>
      ))}
    </View>
  );
};
