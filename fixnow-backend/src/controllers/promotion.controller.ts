import { Request, Response } from "express";
import {
  createPromotionService,
  getAllPromotionsService,
  getPromotionByIdService,
  updatePromotionService,
  deletePromotionService,
  validatePromotionService,
} from "../services/promotion.service";

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const promotion = await createPromotionService(req.body);
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: "Error creating promotion", error });
  }
};

export const getAllPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await getAllPromotionsService();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching promotions", error });
  }
};

export const getPromotionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const promotion = await getPromotionByIdService(id);

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: "Error fetching promotion", error });
  }
};

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const updated = await updatePromotionService(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json({
      message: "Promotion updated successfully",
      promotion: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating promotion", error });
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const deleted = await deletePromotionService(id);

    if (!deleted) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting promotion", error });
  }
};

export const validatePromotion = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    const promotion = await validatePromotionService(code);

    res.json({
      success: true,
      data: promotion,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};