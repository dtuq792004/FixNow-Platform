import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { FILTER_LABELS, type RequestFilterOption } from '~/features/requests/types';

interface RequestsFilterTabsProps {
  active: RequestFilterOption;
  counts: Record<RequestFilterOption, number>;
  onChange: (f: RequestFilterOption) => void;
}

const FILTERS: RequestFilterOption[] = ['all', 'active', 'completed', 'cancelled'];

export const RequestsFilterTabs = ({ active, counts, onChange }: RequestsFilterTabsProps) => (
  // Fixed height prevents layout shift when switching filters (badge appears/disappears)
  <View style={{ height: 56, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ height: 56 }}
      contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', gap: 8 }}
    >
      {FILTERS.map((f) => {
        const isActive = f === active;
        return (
          <Pressable
            key={f}
            onPress={() => onChange(f)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: isActive ? '#18181b' : '#f4f4f5',
              height: 34,
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={{ color: isActive ? '#ffffff' : '#52525b', fontSize: 13, fontWeight: isActive ? '600' : '400', lineHeight: 18 } as never}
            >
              {FILTER_LABELS[f]}
            </Text>
            {counts[f] > 0 && (
              <View
                style={{
                  marginLeft: 6,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#e4e4e7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: '700', color: isActive ? '#fff' : '#71717a', lineHeight: 16 } as never}
                >
                  {counts[f]}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
);
