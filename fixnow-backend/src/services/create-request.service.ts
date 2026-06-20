import Service from "../models/service.model";
import Request from "../models/request.model";
import { PaymentService } from "./payment.service";
import { calculatePayment } from "../utils/calculate.util";
import { sendNewRequestToMatchingProviders } from "../sockets/notification.socket";

interface CreateRequestDto {
  categoryId?: string;
  addressText?: string;
  title?: string;
  note?: string;
  services?: string[];
  addressId?: string;
  description?: string;
  media?: string[];
  requestType?: "NORMAL" | "URGENT" | "RECURRING";
  promoCode?: string;
  promotionCode?: string;
  startAt?: Date;
}

export const createRequest = async (customerId: string, data: CreateRequestDto) => {
  const promoCode = data.promoCode || data.promotionCode;
  const { services } = data;

  let totalPrice = 0;
  let discountAmount = 0;
  let finalPrice = 0;
  let appliedPromoCode = "";
  let resolvedServices: string[] = [];
  let resolvedCategoryId = data.categoryId;

  // Pricing: only when specific services are selected
  if (services && services.length > 0) {
    const serviceDocs = await Service.find({ _id: { $in: services } });

    if (serviceDocs.length !== services.length) {
      throw new Error("Some services not found");
    }

    const serviceCategoryIds = [
      ...new Set(serviceDocs.map((service) => service.categoryId.toString())),
    ];
    if (serviceCategoryIds.length !== 1) {
      throw new Error("All services must belong to the same category");
    }
    if (data.categoryId && serviceCategoryIds[0] !== data.categoryId) {
      throw new Error("Selected services do not belong to the request category");
    }

    resolvedCategoryId = serviceCategoryIds[0];
    resolvedServices = services;
    totalPrice = serviceDocs.reduce((sum, s) => sum + s.price, 0);
    finalPrice = totalPrice;

    if (promoCode && promoCode.trim() !== "") {
      const calculation = await calculatePayment(totalPrice, promoCode);
      discountAmount = calculation.discountAmount;
      finalPrice = calculation.finalAmount;
      appliedPromoCode = calculation.discountCode as string;
    }
  }

  // Skip payment when no pricing (category-only flow)
  const status = finalPrice > 0 ? "AWAITING_PAYMENT" : "PENDING";

  const request = await Request.create({
    customerId,
    categoryId: resolvedCategoryId,
    addressId: data.addressId,
    addressText: data.addressText,
    title: data.title,
    description: data.description,
    note: data.note,
    media: data.media,
    services: resolvedServices,
    requestType: data.requestType || "NORMAL",
    startAt: data.startAt,
    totalPrice,
    discountAmount,
    finalPrice,
    promoCode: appliedPromoCode,
    status,
  });

  let checkoutUrl: string | undefined;
  if (finalPrice > 0) {
    checkoutUrl = await PaymentService.createPayment(request);
  } else {
    await sendNewRequestToMatchingProviders(request._id.toString());
  }

  return { request, checkoutUrl };
};
