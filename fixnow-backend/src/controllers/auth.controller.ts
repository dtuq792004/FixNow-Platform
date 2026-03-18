import { Request, Response } from "express";
import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  verifyOtpService,
  changePasswordService,
} from "../services/auth.service";
import Session from "../models/session.model";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày

export const register = async (req: Request, res: Response) => {
  try {
    const { password, fullName, email, phone, role } = req.body;
    if (!password || !fullName || !email || !phone) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }

    const user = await registerService(password, fullName, email, phone, role);

    return res.status(201).json({
      message: "Đăng ký thành công",
      user,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(400).json({
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};

/* -------------------------- LOGIN -------------------------- */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc" });
    }

    const result = await loginService(email, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.json({
      message: "Đăng nhập thành công",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(401).json({ message: error.message || "Lỗi máy chủ nội bộ" });
  }
};

/* -------------------------- REFRESH ACCESS TOKEN -------------------------- */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Thiếu refresh token" });
    }

    const result = await refreshTokenService(refreshToken);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Lỗi làm mới token:", error.message);
    res.status(403).json({ message: error.message || "Lỗi máy chủ nội bộ" });
  }
};

/* -------------------------- LOGOUT -------------------------- */
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "Thiếu refresh token" });
    }

    await logoutService(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error: any) {
    console.error("Lỗi đăng xuất:", error.message);
    res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
  }
};

/* -------------------------- FORGOT PASSWORD -------------------------- */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email không được để trống",
      });
    }

    const result = await forgotPasswordService(email);

    return res.status(200).json({
      message: "OTP đã được gửi đến email của bạn",
      otp: process.env.NODE_ENV === 'development' ? (result as any).otp : undefined // Chỉ hiện OTP trong development
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(400).json({
      message: error.message || "Có lỗi xảy ra, vui lòng thử lại sau",
    });
  }
};

// Xác thực OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const result = await verifyOtpService(otp);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Lỗi server" });
  }
};

// Đặt lại mật khẩu mới (sau khi đã verify OTP)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    const result = await resetPasswordService(resetToken, newPassword, confirmPassword);
    return res.json(result);
  } catch (error: any) {
    console.error("Reset password error:", error);
    return res.status(400).json({
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};


export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const refreshToken = req.cookies.refreshToken;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        message: "Không xác thực được người dùng",
      });
    }

    if (!refreshToken) {
      return res.status(401).json({
        message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
      });
    }

    // Verify refresh token still exists and is valid
    const session = await Session.findOne({ refreshToken });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
      });
    }
    
    const result = await changePasswordService(userId, currentPassword, newPassword, confirmPassword);
    return res.json(result);
  } catch (error: any) {
    console.error("Change password error:", error);
    const statusCode = error.message.includes("Không tìm thấy") ? 404 : 
                       error.message.includes("không đúng") ? 401 : 400;
    return res.status(statusCode).json({
      message: error.message || "Lỗi máy chủ nội bộ",
    });
  }
};
