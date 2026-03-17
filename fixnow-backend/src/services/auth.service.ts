import User, { IUser } from "../models/user.model";
import Session from "../models/session.model";
import PasswordResetToken from "../models/passwordResetToken.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { generateOtp } from "../utils/generateOtp";
import { hashToken } from "../utils/hashToken";
import { sendOtpEmail } from "../utils/sendEmail";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 
                       process.env.JWT_ACCESS_SECRET ||
                       process.env.TOKEN_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET (hoặc JWT_SECRET/JWT_ACCESS_SECRET/TOKEN_SECRET) chưa được định nghĩa trong biến môi trường.");
}

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("Thông tin đăng nhập không hợp lệ");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Thông tin đăng nhập không hợp lệ");
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

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

export const registerService = async (
  password: string,
  fullName: string,
  email: string,
  phone?: string,
  role?: string
) => {
  const existedUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedUser) {
    throw new Error("Email hoặc số điện thoại đã tồn tại");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    passwordHash,
    fullName,
    email,
    phone,
    role: role || "CUSTOMER",
  });

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
  };
};

export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email không tồn tại trong hệ thống");
  }

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút thay vì 5 phút

  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpire = otpExpires;
  await user.save();

  // Send OTP via email
  try {
    await sendOtpEmail(email, otp);
  } catch (emailError) {
    console.error("Failed to send OTP email:", emailError);
    throw new Error("Không thể gửi email, vui lòng thử lại sau");
  }

  return { 
    success: true, 
    message: "OTP đã được gửi đến email của bạn",
    otp: process.env.NODE_ENV === 'development' ? otp : undefined
  };
};

export const verifyOtpService = async (otp: string) => {
  // Find user by OTP (more complex query since we don't have email)
  const user = await User.findOne({ 
    resetPasswordOtp: otp,
    resetPasswordOtpExpire: { $gt: new Date() }
  });

  if (!user) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");
  }

  // Generate temporary token for password reset (valid for 5 minutes)
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Store token temporarily (could use Redis, but for now use user document)
  user.resetPasswordTokenHash = resetToken;
  await user.save();

  return { 
    message: "Xác thực OTP thành công",
    resetToken // Client should store this for reset password
  };
};

export const resetPasswordService = async (
  resetToken: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (!newPassword || !confirmPassword) {
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Mật khẩu xác nhận không khớp");
  }

  // Find user by reset token
  const user = await User.findOne({ resetPasswordTokenHash: resetToken });

  if (!user) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  // Check if OTP was verified (OTP should still be present and not expired)
  if (!user.resetPasswordOtp || !user.resetPasswordOtpExpire || user.resetPasswordOtpExpire < new Date()) {
    throw new Error("Phiên đặt lại mật khẩu đã hết hạn, vui lòng bắt đầu lại");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpire = undefined;
  user.resetPasswordTokenHash = undefined; // Clear reset token

  await user.save();

  return { message: "Đặt lại mật khẩu thành công" };
};

export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Mật khẩu xác nhận không khớp");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error("Mật khẩu hiện tại không đúng");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  return { message: "Đổi mật khẩu thành công" };
};

export const refreshTokenService = async (refreshToken: string) => {
  const session = await Session.findOne({ refreshToken });
  if (!session || session.expiresAt < new Date()) {
    throw new Error("Refresh token không hợp lệ hoặc đã hết hạn");
  }

  const user = await User.findById(session.userId);
  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  const newAccessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role},
    ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  return {
    message: "Cấp lại access token thành công",
    accessToken: newAccessToken,
  };
};

export const logoutService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("Thiếu refresh token");
  }

  const result = await Session.deleteOne({ refreshToken });

  if (result.deletedCount === 0) {
    throw new Error("Invalid refresh token");
  }

  return { message: "Đăng xuất thành công" };
};



