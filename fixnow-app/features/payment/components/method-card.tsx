import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface MethodCardProps {
  selected: boolean;
  onPress: () => void;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
}

export const MethodCard = ({
  selected,
  onPress,
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
  badgeColor,
}: MethodCardProps) => (
  <Pressable
    onPress={onPress}
    style={[styles.card, selected && styles.cardSelected]}
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
  >
    {/* Selection indicator */}
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>

    {/* Icon */}
    <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
      <Feather name={icon as any} size={22} color={iconColor} />
    </View>

    {/* Text */}
    <View style={styles.cardText}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badgeColor ?? '#f0fdf4' }]}>
            <Text style={[styles.badgeText, { color: badgeColor ? '#fff' : '#16a34a' }]}>
              {badge}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  cardSelected: {
    borderColor: '#18181b',
    backgroundColor: '#f8f8f8',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d4d4d8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: '#18181b',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#18181b',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#71717a',
    lineHeight: 17,
  },
});
