import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, View } from 'react-native';
import { SERVICE_CATEGORIES } from '~/features/home/data/service-categories';

interface SpecialtySelectorProps {
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

export const SpecialtySelector = ({ value, onChange, error }: SpecialtySelectorProps) => {
  const toggle = (type: string) => {
    if (value.includes(type)) {
      onChange(value.filter((s) => s !== type));
    } else {
      onChange([...value, type]);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = value.includes(cat.type);
          return (
            <Pressable
              key={cat.type}
              onPress={() => toggle(cat.type)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 12, paddingVertical: 8,
                borderRadius: 10, borderWidth: 1.5,
                borderColor: isSelected ? '#18181b' : '#e4e4e7',
                backgroundColor: isSelected ? '#18181b' : '#fff',
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Feather
                name={cat.icon as never}
                size={14}
                color={isSelected ? '#fff' : cat.iconColor}
              />
              <RNText style={{
                fontSize: 13, fontWeight: '600',
                color: isSelected ? '#fff' : '#52525b',
              }}>
                {cat.label}
              </RNText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <RNText style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{error}</RNText>
      ) : null}
    </View>
  );
};
