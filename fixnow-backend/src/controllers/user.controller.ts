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

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const avatar = (req as any).imageUrl;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!avatar) return res.status(400).json({ message: "Avatar upload failed" });

    const user = await updateProfileService(userId, { avatar });
    return res.json({ message: "Avatar updated", data: user });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
