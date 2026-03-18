import { Request, Response } from "express";
import { RequestService } from "../services/request.service";

export class RequestController {

  static async providerComplete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await RequestService.providerComplete(id);
      res.json({ message: "Service marked as completed" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async customerConfirm(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await RequestService.customerConfirm(id);
      res.json({ message: "Payment settled to provider" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

}