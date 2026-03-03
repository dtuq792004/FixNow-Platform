import { Request, Response } from "express";
import { Promotion } from "../models/promotion.model";

export class PromotionController {

  static async create(req: Request, res: Response) {
    const promo = await Promotion.create(req.body);
    res.json(promo);
  }

  static async getAll(req: Request, res: Response) {
    const promos = await Promotion.find();
    res.json(promos);
  }

  static async update(req: Request, res: Response) {
    const promo = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(promo);
  }

  static async delete(req: Request, res: Response) {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  }

}