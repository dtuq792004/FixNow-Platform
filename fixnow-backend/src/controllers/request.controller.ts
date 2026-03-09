import { Request, Response } from "express";
import { RequestService } from "../services/request.service";

export class RequestController {

  static async providerComplete(req: Request, res: Response) {
    try {
      await RequestService.providerComplete(req.params.id);
      res.json({ message: "Service marked as completed" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async customerConfirm(req: Request, res: Response) {
    try {
      await RequestService.customerConfirm(req.params.id);
      res.json({ message: "Payment settled to provider" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

}