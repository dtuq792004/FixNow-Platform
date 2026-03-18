import { Request, Response } from "express";
import { updateProfileService } from "../services/user.service";

export const getProfile = async (req: Request, res: Response) => {
  return res.json({
    message: "User profile",
    user: (req as any).user
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const user = await updateProfileService(userId!, req.body);

    res.json({
      message: "Profile updated successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: "Update profile failed"
    });
  }
};