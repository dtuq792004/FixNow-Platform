import { Promotion } from "../models/promotion.model";
import { PlatformSetting } from "../models/platformSetting.model";

export async function calculatePayment(
  baseAmount: number,
  promoCode?: string
) {

  if (baseAmount <= 0) {
    throw new Error("Invalid base amount");
  }

  // Lấy platform fee config
  const config = await PlatformSetting.findOne();
  const platformFeePercent = config?.platformFeePercent ?? 20;

  let discountAmount = 0;
  let discountCode: string | undefined;

  if (promoCode) {

    const promo = await Promotion.findOne({
      code: promoCode.toUpperCase(),
      isActive: true
    });

    if (!promo) {
      throw new Error("Invalid promo code");
    }

    // Check expiration
    if (promo.expiredAt && promo.expiredAt < new Date()) {
      throw new Error("Promo expired");
    }

    // Check usage limit
    if (
      promo.usageLimit !== null &&
      promo.usageLimit !== undefined &&
      promo.usedCount >= promo.usageLimit
    ) {
      throw new Error("Promo usage limit reached");
    }

    discountCode = promo.code;

    // Calculate discount
    if (promo.discountType === "PERCENT") {
      discountAmount = baseAmount * (promo.discountValue / 100);
    } else {
      discountAmount = promo.discountValue;
    }

    // Không cho giảm quá tiền gốc
    if (discountAmount > baseAmount) {
      discountAmount = baseAmount;
    }

    // // ⚠️ NOTE: production nên tăng usedCount khi tạo Payment
    // promo.usedCount += 1;
    // await promo.save();
  }

  const afterDiscount = baseAmount - discountAmount;

  // tính platform fee từ percent
  const platformFee = afterDiscount * (platformFeePercent / 100);

  const providerAmount = afterDiscount - platformFee;

  // Làm tròn tiền
  const round = (num: number) => Math.round(num * 100) / 100;

  return {
    originalAmount: round(baseAmount),
    discountCode,
    discountAmount: round(discountAmount),
    finalAmount: round(afterDiscount),
    platformFeePercent,
    platformFee: round(platformFee),
    providerAmount: round(providerAmount)
  };
}