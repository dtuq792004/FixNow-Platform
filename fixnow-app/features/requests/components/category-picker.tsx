import { Feather } from '@expo/vector-icons';
import { Pressable, Text as RNText, ScrollView, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { SERVICE_CATEGORIES } from '~/features/home/data/service-categories';
import type { ServiceCategoryType } from '~/features/requests/types';

interface CategoryPickerProps {
  selected: ServiceCategoryType | undefined;
  onSelect: (category: ServiceCategoryType) => void;
  error?: string;
}

const OTHER_CATEGORY = {
  type: 'other' as ServiceCategoryType,
  label: 'Khác',
  description: 'Dịch vụ sửa chữa khác',
  icon: 'tool',
  bgClass: 'bg-gray-100',
  iconColor: '#6B7280',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  electrical: 'Điện dân dụng, đèn, ổ cắm',
  plumbing: 'Ống nước, vòi, bồn rửa',
  hvac: 'Máy lạnh, điều hòa, quạt',
  appliance: 'Tủ lạnh, máy giặt, TV',
  security: 'Khóa, cửa, bảo mật',
  painting: 'Sơn tường, trần, nội thất',
  other: 'Dịch vụ sửa chữa khác',
};

const ALL_CATEGORIES = [
  ...SERVICE_CATEGORIES.map((c) => ({
    ...c,
    description: CATEGORY_DESCRIPTIONS[c.type] ?? '',
  })),
  { ...OTHER_CATEGORY, description: OTHER_CATEGORY.description },
];

interface CategoryItemProps {
  type: ServiceCategoryType;
  label: string;
  description: string;
  icon: string;
  iconColor: string;
  bgClass: string;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryItem = ({
  label,
  description,
  icon,
  iconColor,
  bgClass,
  isSelected,
  onPress,
}: CategoryItemProps) => (
  <Pressable
    onPress={onPress}
    className="active:opacity-80"
    style={{ width: '48%', marginBottom: 12 }}
    accessibilityRole="radio"
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={label}
  >
    <View
      style={{
        borderRadius: 16,
        borderWidth: 2,
        borderColor: isSelected ? '#18181b' : '#e4e4e7',
        backgroundColor: isSelected ? '#fafafa' : '#ffffff',
        padding: 14,
      }}
    >
      {/* Icon */}
      <View
        className={bgClass}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Feather name={icon as never} size={22} color={iconColor} />
      </View>

      {/* Label + description */}
      <RNText style={{ fontSize: 14, fontWeight: '700', color: '#18181b', marginBottom: 2 }}>
        {label}
      </RNText>
      <RNText style={{ fontSize: 11, color: '#71717a', lineHeight: 15 }}>{description}</RNText>

      {/* Selected checkmark */}
      {isSelected && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#18181b',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="check" size={11} color="#fff" />
        </View>
      )}
    </View>
  </Pressable>
);

export const CategoryPicker = ({ selected, onSelect, error }: CategoryPickerProps) => (
  <View style={{ flex: 1 }}>
    <View style={{ paddingHorizontal: 20, marginBottom: 6 }}>
      <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b', marginBottom: 4 }}>
        Bạn cần hỗ trợ gì?
      </RNText>
      <RNText style={{ fontSize: 14, color: '#71717a' }}>
        Chọn loại dịch vụ phù hợp với vấn đề của bạn
      </RNText>
    </View>

    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {ALL_CATEGORIES.map((category) => (
          <CategoryItem
            key={category.type}
            {...category}
            isSelected={selected === category.type}
            onPress={() => onSelect(category.type)}
          />
        ))}
      </View>

      {error && (
        <Text className="text-destructive text-sm mt-1">{error}</Text>
      )}
    </ScrollView>
  </View>
);
