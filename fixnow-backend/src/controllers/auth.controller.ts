import { Request, Response } from "express";
import { loginService } from "../services/auth.service";
import { registerService } from "../services/auth.service";
import { registerSchema, forgotPasswordSchema, resetPasswordWithOtpSchema } from "../validators/auth.validator";
import {
  forgotPasswordService,
  resetPasswordService,
  verifyOtpAndResetPasswordService,
  refreshTokenService,
  logoutService
} from "../services/auth.service";

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const result = await forgotPasswordService(email);

    res.json({
      message: result.message,
      success: result.success
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};


export const login = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;

    const result = await loginService(email, password);

    res.status(200).json({
      message: "Login success",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      }
    });

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    });

  }
};

export const register = async (req: Request, res: Response) => {
  try {

    const data = registerSchema.parse(req.body);

    const user = await registerService(
      data.email,
      data.password,
      data.fullName,
      data.phone
    );

    res.status(201).json({
      message: "Register success",
      user
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required"
      });
    }

    const result = await logoutService(refreshToken);

    res.json({
      message: result.message
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const result = await forgotPasswordService(email);

    res.json({
      message: result.message,
      success: result.success
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await resetPasswordService(token as string, password);

    res.json({
      message: "Password reset successful"
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = resetPasswordWithOtpSchema.parse(req.body);

    await verifyOtpAndResetPasswordService(email, otp, password);

    res.json({
      message: "Password reset successful"
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required"
      });
    }

    const result = await refreshTokenService(refreshToken);

    res.json({
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });

  } catch (error: any) {
    res.status(401).json({
      message: error.message
    });
  }
};
