import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { FormFieldWrapper } from "~/components/ui/form-control";
import { PREDEFINED_CATEGORIES } from "~/utils/categories";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  label?: string;
  className?: string;
}

export function CategorySelector({ 
  selectedCategory, 
  onCategoryChange, 
  label = "Category",
  className 
}: CategorySelectorProps) {
  return (
    <FormFieldWrapper
      label={label}
      className={className}
    >
      <View className="flex-row flex-wrap gap-2">
        {PREDEFINED_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.value}
            onPress={() => onCategoryChange(category.value)}
            style={{
              backgroundColor: selectedCategory === category.value ? category.color : '#f3f4f6',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: selectedCategory === category.value ? 'white' : '#374151',
                fontSize: 14,
                fontWeight: selectedCategory === category.value ? '600' : '400',
              }}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </FormFieldWrapper>
  );
}