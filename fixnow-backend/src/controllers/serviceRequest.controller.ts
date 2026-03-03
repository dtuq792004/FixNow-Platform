import { Request, Response } from "express";
import { ServiceRequestService } from "../services/serviceRequest.service";

export class ServiceRequestController {

  static async providerComplete(req: Request, res: Response) {
    try {
      await ServiceRequestService.providerComplete(req.params.id);
      res.json({ message: "Service marked as completed" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async customerConfirm(req: Request, res: Response) {
    try {
      await ServiceRequestService.customerConfirm(req.params.id);
      res.json({ message: "Payment settled to provider" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

}