import { Request, Response } from "express";
import {
  createWithdrawRequestService,
  approveWithdrawRequestService,
  rejectWithdrawRequestService,
  getUserWithdrawRequestsService,
  getAllWithdrawRequestsService
} from "../services/withdraw.service";

export const createWithdrawRequestController = async (req: Request, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.id;

    const { amount, bankName, accountNumber, accountHolder } = req.body;

    const result = await createWithdrawRequestService(
      userId,
      amount,
      bankName,
      accountNumber,
      accountHolder
    );

    res.status(201).json({
      message: "Withdraw request created",
      data: result
    });

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    });

  }
};

export const getUserWithdrawRequestsController = async (req: Request, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const result = await getUserWithdrawRequestsService(userId);

    res.json(result);

  } catch (error: any) {

    res.status(400).json({ message: error.message });

  }
};

export const getAllWithdrawRequestsController = async (req: Request, res: Response) => {
  try {

    const { status } = req.query;

    const result = await getAllWithdrawRequestsService(status as string);

    res.json(result);

  } catch (error: any) {

    res.status(400).json({ message: error.message });

  }
};

export const approveWithdrawRequestController = async (req: Request, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const adminId = req.user.id;

    const id = req.params.id as string;

    const result = await approveWithdrawRequestService(id, adminId);

    res.json({
      message: "Withdraw approved",
      data: result
    });

  } catch (error: any) {

    res.status(400).json({ message: error.message });

  }
};

export const rejectWithdrawRequestController = async (req: Request, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const adminId = req.user.id;

    const id = req.params.id as string;
    const { reason } = req.body;

    const result = await rejectWithdrawRequestService(id, adminId, reason);

    res.json({
      message: "Withdraw rejected",
      data: result
    });

  } catch (error: any) {

    res.status(400).json({ message: error.message });

  }
};
