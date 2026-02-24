import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, UserDocument } from "../models/user.model";
import Session from "../models/session.model";
import { generateOtp } from "../utils/generateOtp";
import PasswordResetToken from "../models/passwordResetToken.model";
import { hashToken } from "../utils/hashToken";
import { sendResetPasswordEmail } from "../utils/sendEmail";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 
                       process.env.JWT_ACCESS_SECRET ||
                       process.env.TOKEN_SECRET;
if (!ACCESS_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET (hoặc JWT_SECRET/JWT_ACCESS_SECRET/TOKEN_SECRET) chưa được định nghĩa trong biến môi trường.");
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName || !email || !phone) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });

    if (existedUser) {
      return res.status(400).json({
        message: "Username, email hoặc số điện thoại đã tồn tại",
      });
    }

    const newUser = await User.create({
      username,
      password, 
      fullName,
      email,
      phone,
      role: role || "Customer",
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

/* -------------------------- LOGIN -------------------------- */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập và mật khẩu là bắt buộc" });
    }

    const user = (await User.findOne({ username })
      .select("+password")) as UserDocument | null;

    if (!user || user.status !== "Active") {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.json({
      message: "Đăng nhập thành công",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/* -------------------------- REFRESH ACCESS TOKEN -------------------------- */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Thiếu refresh token" });
    }

    const session = await Session.findOne({ refreshToken });
    if (!session || session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role},
      ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({
      message: "Cấp lại access token thành công",
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error("Lỗi làm mới token:", error.message);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/* -------------------------- LOGOUT -------------------------- */
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "Thiếu refresh token" });
    }

    await Session.deleteOne({ refreshToken });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error: any) {
    console.error("Lỗi đăng xuất:", error.message);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "Nếu email tồn tại, hệ thống sẽ gửi link đặt lại mật khẩu",
      });
    }

    const resetToken = jwt.sign(
      {
        userId: user._id,
        type: "RESET_PASSWORD",
      },
      process.env.RESET_PASSWORD_SECRET as string,
      { expiresIn: "5m" }
    );

    const tokenHash = hashToken(resetToken);

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: false,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail(user.email, resetLink);

    return res.status(200).json({
      message: "Nếu email tồn tại, hệ thống sẽ gửi link đặt lại mật khẩu",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại sau",
    });
  }
};

// Xác thực OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires)
      return res.status(400).json({ message: "OTP không hợp lệ" });

    if (user.otp !== otp) return res.status(400).json({ message: "OTP sai" });

    if (user.otpExpires < new Date())
      return res.status(400).json({ message: "OTP đã hết hạn" });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: "Xác thực OTP thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

// Đổi mật khẩu mới
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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const user = (await User.findById(userId)
      .select("+password")) as UserDocument | null;

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

