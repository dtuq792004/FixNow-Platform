import { Request, Response } from "express";
import { loginService } from "../services/auth.service";
import { registerService } from "../services/auth.service";
import { registerSchema } from "../validators/auth.validator";

export const login = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;

    const result = await loginService(email, password);

    res.status(200).json({
      message: "Login success",
      data: result
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
  return res.json({
    message: "Logout successful"
  });
};