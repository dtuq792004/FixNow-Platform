import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text as RNText, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { getCategoryConfig } from '~/features/home/data/service-categories';
import type { CreateRequestSchema } from '~/features/requests/validations/create-request.schema';

interface ConfirmSummaryProps {
  data: CreateRequestSchema;
  isSubmitting: boolean;
  onSubmit: () => void;
}

interface SummaryRowProps {
  icon: string;
  label: string;
  value: string;
}

const SummaryRow = ({ icon, label, value }: SummaryRowProps) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f4f4f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 1,
        flexShrink: 0,
      }}
    >
      <Feather name={icon as never} size={16} color="#52525b" />
    </View>
    <View style={{ flex: 1 }}>
      <RNText style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 2 }}>{label}</RNText>
      <RNText style={{ fontSize: 14, color: '#18181b', lineHeight: 20 }}>{value}</RNText>
    </View>
  </View>
);

export const ConfirmSummary = ({ data, isSubmitting, onSubmit }: ConfirmSummaryProps) => {
  const category = getCategoryConfig(data.category);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 24 }}>
        <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b', marginBottom: 4 }}>
          Kiểm tra lại thông tin
        </RNText>
        <RNText style={{ fontSize: 14, color: '#71717a' }}>
          Xem lại yêu cầu trước khi gửi
        </RNText>
      </View>

      {/* Summary card */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#e4e4e7',
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
          backgroundColor: '#fafafa',
        }}
      >
        {/* Category badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e4e4e7',
          }}
        >
          <View
            className={category.bgClass}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Feather name={category.icon as never} size={18} color={category.iconColor} />
          </View>
          <View>
            <RNText style={{ fontSize: 12, color: '#a1a1aa' }}>Loại dịch vụ</RNText>
            <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b' }}>
              {category.label}
            </RNText>
          </View>
        </View>

        <SummaryRow icon="file-text" label="Tiêu đề" value={data.title} />
        <SummaryRow icon="align-left" label="Mô tả vấn đề" value={data.description} />
        <SummaryRow icon="map-pin" label="Địa chỉ" value={data.address} />
        {data.note ? (
          <SummaryRow icon="message-circle" label="Ghi chú" value={data.note} />
        ) : null}
      </View>

      {/* Info note */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: '#eff6ff',
          borderRadius: 12,
          padding: 12,
          marginBottom: 24,
        }}
      >
        <Feather name="info" size={16} color="#3b82f6" style={{ marginRight: 8, marginTop: 1 }} />
        <RNText style={{ fontSize: 12, color: '#1d4ed8', flex: 1, lineHeight: 18 }}>
          Sau khi gửi, chúng tôi sẽ tìm thợ phù hợp và thông báo cho bạn trong thời gian sớm nhất.
        </RNText>
      </View>

      {/* Submit button */}
      <Button
        variant="brand"
        className="rounded-xl native:h-14"
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Feather name="send" size={16} color="#ffffff" />
            <Text className="ml-2 font-semibold native:text-base">Gửi yêu cầu</Text>
          </>
        )}
      </Button>
    </ScrollView>
  );
};
