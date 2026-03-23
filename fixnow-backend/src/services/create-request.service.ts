import Service from "../models/service.model";
import Request from "../models/request.model";
import { PaymentService } from "./payment.service";
import { calculatePayment } from "../utils/calculate.util";

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
  startAt?: Date;
}

export const createRequest = async (customerId: string, data: CreateRequestDto) => {
  const { services, promoCode } = data;

  let totalPrice = 0;
  let discountAmount = 0;
  let finalPrice = 0;
  let appliedPromoCode = "";
  let resolvedServices: string[] = [];

  // Pricing: only when specific services are selected
  if (services && services.length > 0) {
    const serviceDocs = await Service.find({ _id: { $in: services } });

    if (serviceDocs.length !== services.length) {
      throw new Error("Some services not found");
    }

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
    categoryId: data.categoryId,
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
  }

  return { request, checkoutUrl };
};
