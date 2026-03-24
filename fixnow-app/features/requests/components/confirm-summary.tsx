import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { getCategoryConfig } from '~/features/home/data/service-categories';
import {
  type PromotionResult,
  validatePromotionApi,
} from '~/features/requests/services/request.service';
import type { CreateRequestSchema } from '~/features/requests/validations/create-request.schema';

interface ConfirmSummaryProps {
  data: CreateRequestSchema;
  isSubmitting: boolean;
  onSubmit: (promotionCode?: string) => void;
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

const formatPrice = (price: number, unit?: 'hour' | 'job') => {
  const formatted = price.toLocaleString('vi-VN');
  return unit === 'hour' ? `${formatted} ₫/giờ` : `${formatted} ₫`;
};

const calcDiscount = (basePrice: number, promo: PromotionResult): number => {
  if (promo.discountType === 'PERCENT') {
    return Math.round((basePrice * promo.discountValue) / 100);
  }
  return Math.min(promo.discountValue, basePrice);
};

export const ConfirmSummary = ({ data, isSubmitting, onSubmit }: ConfirmSummaryProps) => {
  const category = getCategoryConfig(data.category);

  // ── Promotion state ─────────────────────────────────────────────────────────
  const [promoInput, setPromoInput] = useState(data.promotionCode ?? '');
  const [promoResult, setPromoResult] = useState<PromotionResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const hasService = !!data.serviceId && !!data.serviceName && data.servicePrice !== undefined;
  const basePrice = data.servicePrice ?? 0;
  const discountAmount = promoResult && hasService ? calcDiscount(basePrice, promoResult) : 0;
  const finalPrice = basePrice - discountAmount;

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    setPromoResult(null);
    try {
      const result = await validatePromotionApi(code);
      setPromoResult(result);
    } catch (err: any) {
      setPromoError(err?.message ?? 'Mã không hợp lệ');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoResult(null);
    setPromoInput('');
    setPromoError(null);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Heading */}
      <View style={{ marginBottom: 20 }}>
        <RNText style={{ fontSize: 20, fontWeight: '700', color: '#18181b', marginBottom: 4 }}>
          Kiểm tra lại thông tin
        </RNText>
        <RNText style={{ fontSize: 14, color: '#71717a' }}>
          Xem lại yêu cầu trước khi gửi
        </RNText>
      </View>

      {/* ── Summary card ──────────────────────────────────────────────────────── */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#e4e4e7',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
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

        {/* Selected service row */}
        {hasService && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#18181b',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Feather name="tool" size={16} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <RNText style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 2 }}>
                Dịch vụ đã chọn
              </RNText>
              <RNText style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
                {data.serviceName}
              </RNText>
            </View>
            <RNText style={{ fontSize: 14, fontWeight: '700', color: '#f97316' }}>
              {formatPrice(basePrice, data.serviceUnit)}
            </RNText>
          </View>
        )}

        <SummaryRow icon="file-text" label="Tiêu đề" value={data.title} />
        <SummaryRow icon="align-left" label="Mô tả vấn đề" value={data.description} />
        <SummaryRow icon="map-pin" label="Địa chỉ" value={data.address} />
        {data.note ? (
          <SummaryRow icon="message-circle" label="Ghi chú" value={data.note} />
        ) : null}
      </View>

      {/* ── Promotion section ─────────────────────────────────────────────────── */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#e4e4e7',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          backgroundColor: '#fafafa',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Feather name="tag" size={16} color="#18181b" style={{ marginRight: 8 }} />
          <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b' }}>
            Mã giảm giá
          </RNText>
        </View>

        {promoResult ? (
          /* Applied promo chip */
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f0fdf4',
              borderWidth: 1.5,
              borderColor: '#86efac',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Feather name="check-circle" size={18} color="#16a34a" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <RNText style={{ fontSize: 14, fontWeight: '700', color: '#15803d' }}>
                {promoResult.code}
              </RNText>
              <RNText style={{ fontSize: 12, color: '#4ade80', marginTop: 1 }}>
                {promoResult.discountType === 'PERCENT'
                  ? `Giảm ${promoResult.discountValue}%`
                  : `Giảm ${promoResult.discountValue.toLocaleString('vi-VN')} ₫`}
              </RNText>
            </View>
            <TouchableOpacity onPress={handleRemovePromo} hitSlop={8}>
              <Feather name="x-circle" size={20} color="#86efac" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Input row */
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={promoInput}
              onChangeText={(t) => {
                setPromoInput(t.toUpperCase());
                setPromoError(null);
              }}
              placeholder="Nhập mã khuyến mãi..."
              placeholderTextColor="#a1a1aa"
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleApplyPromo}
              style={{
                flex: 1,
                height: 46,
                borderWidth: 1.5,
                borderColor: promoError ? '#ef4444' : '#e4e4e7',
                borderRadius: 12,
                paddingHorizontal: 14,
                fontSize: 14,
                color: '#18181b',
                backgroundColor: '#ffffff',
                letterSpacing: 1,
              }}
            />
            <TouchableOpacity
              onPress={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              style={{
                height: 46,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  promoLoading || !promoInput.trim() ? '#e4e4e7' : '#18181b',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {promoLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <RNText
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: promoInput.trim() ? '#ffffff' : '#a1a1aa',
                  }}
                >
                  Áp dụng
                </RNText>
              )}
            </TouchableOpacity>
          </View>
        )}

        {promoError && (
          <RNText style={{ fontSize: 12, color: '#ef4444', marginTop: 6, marginLeft: 2 }}>
            {promoError}
          </RNText>
        )}
      </View>

      {/* ── Payment summary (only when service selected) ────────────────────── */}
      {hasService && (
        <View
          style={{
            borderWidth: 1,
            borderColor: '#e4e4e7',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            backgroundColor: '#fafafa',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Feather name="credit-card" size={16} color="#18181b" style={{ marginRight: 8 }} />
            <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b' }}>
              Tóm tắt thanh toán
            </RNText>
          </View>

          {/* Base price row */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
          >
            <RNText style={{ fontSize: 13, color: '#71717a' }}>Phí dịch vụ</RNText>
            <RNText style={{ fontSize: 13, color: '#18181b' }}>
              {formatPrice(basePrice, data.serviceUnit)}
            </RNText>
          </View>

          {/* Discount row */}
          {promoResult && discountAmount > 0 && (
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
            >
              <RNText style={{ fontSize: 13, color: '#16a34a' }}>
                Giảm giá ({promoResult.code})
              </RNText>
              <RNText style={{ fontSize: 13, fontWeight: '600', color: '#16a34a' }}>
                -{discountAmount.toLocaleString('vi-VN')} ₫
              </RNText>
            </View>
          )}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#e4e4e7', marginVertical: 8 }} />

          {/* Total row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181b' }}>
              Tổng cộng
            </RNText>
            <RNText style={{ fontSize: 16, fontWeight: '700', color: '#f97316' }}>
              {finalPrice.toLocaleString('vi-VN')} ₫
            </RNText>
          </View>
        </View>
      )}

      {/* ── Info note ─────────────────────────────────────────────────────────── */}
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

      {/* ── Submit ────────────────────────────────────────────────────────────── */}
      <Button
        variant="brand"
        className="rounded-xl native:h-14"
        onPress={() => onSubmit(promoResult?.code)}
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
