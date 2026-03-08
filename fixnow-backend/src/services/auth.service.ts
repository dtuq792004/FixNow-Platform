import User from "../models/user.model";
import { comparePassword } from "../utils/password.util";
import { generateToken } from "../utils/jwt.util";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/password.util";

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

export const loginService = async (email: string, password: string) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "BANNED") {
    throw new Error("Account is banned");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = generateToken({
    userId: user._id,
    role: user.role
  });

  return {
    token,
    user
  };
};