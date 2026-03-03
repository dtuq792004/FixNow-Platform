import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { ServiceRequest } from "../models/serviceRequest.model";
import { Payment } from "../models/payment.model";

export class PaymentController {

  // Tạo link thanh toán
  static async create(req: Request, res: Response) {
    try {
      const { serviceRequestId, promoCode } = req.body;

      const sr = await ServiceRequest.findById(serviceRequestId);
      if (!sr) return res.status(404).json({ message: "ServiceRequest not found" });

      const url = await PaymentService.createPayment(sr, promoCode);

      res.json({ checkoutUrl: url });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // Webhook từ PayOS
  static async webhook(req: Request, res: Response) {
    try {
      await PaymentService.handleWebhook(req.body);
      res.sendStatus(200);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // Refund
  static async refund(req: Request<{ paymentId: string }>, res: Response) {
    try {
      const { paymentId } = req.params;
      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      await PaymentService.refund(paymentId);

      res.json({ message: "Refund success" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

}