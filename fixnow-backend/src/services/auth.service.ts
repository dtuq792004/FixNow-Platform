import User from "../models/user.model";
import Session from "../models/session.model";
import { comparePassword } from "../utils/password.util";
import { generateToken } from "../utils/jwt.util";
import { hashPassword } from "../utils/password.util";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { generateResetToken } from "../utils/resetToken.ulti";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.util";
import { sendOtpEmail } from "../utils/sendEmail";
import { generateRefreshToken, hashRefreshToken, verifyRefreshToken } from "../utils/refreshToken.util";

export const loginService = async (email: string, password: string) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "BANNED") {
    throw new Error("Account is banned");
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const accessToken = generateToken({
    userId: user._id,
    role: user.role
  });

  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(refreshToken);
  
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.deleteMany({ userId: user._id });

  await Session.create({
    userId: user._id,
    refreshToken: hashedRefreshToken,
    expiresAt
  });

  return {
    accessToken,
    refreshToken,
    user
  };
};

export const registerService = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
) => {

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash,
    fullName,
    phone
  });

  return user;
};


export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    // For security, don't reveal if user exists
    return { success: true, message: "If an account exists, a reset code has been sent1" };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  user.resetPasswordOtp = otpHash;
  user.resetPasswordOtpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  try {
    await sendOtpEmail(email, otp);
  } catch (emailError) {
    console.error("Failed to send OTP email:", emailError);
    // Still continue - OTP is saved in database
  }

  return { success: true, message: "If an account exists, a reset code has been sent" };
};

export const resetPasswordService = async (
  token: string,
  password: string
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  user.passwordHash = passwordHash;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
};

export const verifyOtpAndResetPasswordService = async (
  email: string,
  otp: string,
  password: string
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
    throw new Error("No reset request found");
  }

  if (user.resetPasswordOtpExpire < new Date()) {
    throw new Error("OTP has expired");
  }

  const isValidOtp = verifyOtp(otp, user.resetPasswordOtp);
  if (!isValidOtp) {
    throw new Error("Invalid OTP");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  user.passwordHash = passwordHash;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpire = undefined;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
};

export const refreshTokenService = async (refreshToken: string) => {
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  const session = await Session.findOne({
    refreshToken: hashedRefreshToken,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!session) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = session.userId as any;

  if (user.status === "BANNED") {
    throw new Error("Account is banned");
  }

  await Session.deleteOne({ _id: session._id });

  const newAccessToken = generateToken({
    userId: user._id,
    role: user.role
  });

  const newRefreshToken = generateRefreshToken();
  const newHashedRefreshToken = hashRefreshToken(newRefreshToken);
  
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    userId: user._id,
    refreshToken: newHashedRefreshToken,
    expiresAt
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

export const logoutService = async (refreshToken: string) => {
  const hashedRefreshToken = hashRefreshToken(refreshToken);
  
  const result = await Session.deleteOne({
    refreshToken: hashedRefreshToken
  });

  if (result.deletedCount === 0) {
    throw new Error("Invalid refresh token");
  }

  return { message: "Logout successful" };
};