import { Request, Response } from "express";
import * as adminUserService from "../services/adminUser.service";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, search, page = 1, limit = 5 } = req.query;

    const result = await adminUserService.getUsers(
      role as string,
      status as string,
      search as string,
      Number(page),
      Number(limit)
    );

    return res.json({
      success: true,
      data: result,
      message: "Success",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await adminUserService.getUserById(id as string);

    return res.json({
      success: true,
      data: user,
      message: "Success",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await adminUserService.updateUserStatus(id as string, status);

    return res.json({
      success: true,
      data: user,
      message: "User status updated",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await adminUserService.deleteUser(id as string);

    return res.json({
      success: true,
      data: null,
      message: "User deleted",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};