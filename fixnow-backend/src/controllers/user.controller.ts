import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getProfile = async (req: AuthRequest, res: Response) => {
  return res.json({
    message: "User profile",
    user: req.user
  });
};