import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
import { User, UserDocument } from "../models/user.model";
// import Session from "../models/session.model";
// import { generateOtp } from "../utils/generateOtp";
// import PasswordResetToken from "../models/passwordResetToken.model";
// import { hashToken } from "../utils/hashToken";
// import { sendResetPasswordEmail } from "../utils/sendEmail";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 
                       process.env.JWT_ACCESS_SECRET ||
                       process.env.TOKEN_SECRET;
if (!ACCESS_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET (hoặc JWT_SECRET/JWT_ACCESS_SECRET/TOKEN_SECRET) chưa được định nghĩa trong biến môi trường.");
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const user = (await User.findOne({ email })
      .select("+password")) as UserDocument | null;

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};