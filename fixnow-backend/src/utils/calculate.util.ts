import { Promotion } from "../models/promotion.model";
import { PlatformConfig } from "../models/platformConfig.model";

export async function calculatePayment(
  baseAmount: number,
  promoCode?: string
) {
  if (baseAmount <= 0) {
    throw new Error("Invalid base amount");
  }

  const config = await PlatformConfig.findOne();
  const platformFeePercent = config?.platformFeePercent ?? 0.1;

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

    // Không cho giảm quá số tiền gốc
    if (discountAmount > baseAmount) {
      discountAmount = baseAmount;
    }

    // Tăng usedCount
    promo.usedCount += 1;
    await promo.save();
  }

  const afterDiscount = baseAmount - discountAmount;

  const platformFee = afterDiscount * platformFeePercent;
  const providerAmount = afterDiscount - platformFee;

  // Làm tròn tiền (2 chữ số)
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