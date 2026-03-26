import { Request, Response } from "express";
import * as categoryService from "../services/category.service";

// CREATE
export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return res.json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories();

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET WITH STATS
export const getCategoriesWithStats = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategoriesWithStats();

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const category = await categoryService.getCategoryById(id);

    return res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const category = await categoryService.updateCategory(id, req.body);

    return res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await categoryService.deleteCategory(id);

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};