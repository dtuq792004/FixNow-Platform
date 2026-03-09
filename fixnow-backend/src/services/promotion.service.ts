import { Promotion, IPromotion } from "../models/promotion.model";

export const createPromotionService = async (data: Partial<IPromotion>) => {
  const existing = await Promotion.findOne({ code: data.code });

  if (existing) {
    throw new Error("Promotion code already exists");
  }

  const promotion = new Promotion(data);
  return promotion.save();
};

export const getAllPromotionsService = async () => {
  return Promotion.find().sort({ createdAt: -1 });
};

export const getPromotionByIdService = async (id: string) => {
  const promotion = await Promotion.findById(id);

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  return promotion;
};

export const updatePromotionService = async (
  id: string,
  data: Partial<IPromotion>
) => {
  const promotion = await Promotion.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  return promotion;
};

export const deletePromotionService = async (id: string) => {
  const promotion = await Promotion.findByIdAndDelete(id);

  if (!promotion) {
    throw new Error("Promotion not found");
  }

  return promotion;
};

export const validatePromotionService = async (code: string) => {
  const promotion = await Promotion.findOne({ code: code.toUpperCase() });

  if (!promotion) {
    throw new Error("Promotion code not found");
  }

  if (!promotion.isActive) {
    throw new Error("Promotion is inactive");
  }

  if (promotion.expiredAt && promotion.expiredAt < new Date()) {
    throw new Error("Promotion has expired");
  }

  if (
    promotion.usageLimit !== null &&
    promotion.usedCount >= promotion.usageLimit
  ) {
    throw new Error("Promotion usage limit reached");
  }

  return promotion;
};