import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { SERVICE_CATEGORIES } from '~/features/home/data/service-categories';
import type { ServiceCategoryConfig } from '~/features/home/types';

interface CategoryItemProps {
  category: ServiceCategoryConfig;
  onPress: () => void;
}

const CategoryItem = ({ category, onPress }: CategoryItemProps) => (
  <Pressable
    className="w-1/3 items-center py-3 active:opacity-70"
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={category.label}
  >
    <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${category.bgClass}`}>
      <Feather name={category.icon as never} size={24} color={category.iconColor} />
    </View>
    <Text className="text-xs font-medium text-foreground text-center">{category.label}</Text>
  </Pressable>
);

export const ServiceCategoryGrid = () => {
  const router = useRouter();

  const handleCategoryPress = (type: string) => {
    // TODO: navigate to create request with pre-selected category
    router.push(`/requests/create?category=${type}` as never);
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-foreground mb-3">Dịch vụ</Text>

      <View className="bg-card border border-border rounded-2xl overflow-hidden">
        <View className="flex-row flex-wrap">
          {SERVICE_CATEGORIES.map((category) => (
            <CategoryItem
              key={category.type}
              category={category}
              onPress={() => handleCategoryPress(category.type)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
