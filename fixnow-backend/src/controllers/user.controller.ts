import { Request, Response } from "express";
import { getProfileService, updateProfileService } from "../services/user.service";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await getProfileService(userId);
    return res.json({
      message: "User profile",
      user,
    });
  } catch (error: any) {
    return res.status(404).json({ message: error.message || "User not found" });
  }
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