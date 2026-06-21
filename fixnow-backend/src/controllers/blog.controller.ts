import { Request, Response } from "express";
import * as blogService from "../services/blog.service";

const fail = (res: Response, error: unknown, status = 400) =>
  res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Có lỗi xảy ra" });

export const listAdminBlogs = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await blogService.listAdminBlogs(req.query as never) });
  } catch (error) {
    fail(res, error);
  }
};

export const listPublishedBlogs = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await blogService.listPublishedBlogs(req.query as never) });
  } catch (error) {
    fail(res, error);
  }
};

export const getAdminBlog = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await blogService.getAdminBlog(String(req.params.id)) });
  } catch (error) {
    fail(res, error, 404);
  }
};

export const getPublishedBlog = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await blogService.getPublishedBlog(String(req.params.slug)) });
  } catch (error) {
    fail(res, error, 404);
  }
};

export const getBlogReviews = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await blogService.getBlogReviewSummary(String(req.params.slug)) });
  } catch (error) {
    fail(res, error, 404);
  }
};

export const createBlogReview = async (req: Request, res: Response) => {
  try {
    const data = await blogService.createBlogReview(String(req.params.slug), req.body);
    res.status(201).json({ success: true, data, message: "Cảm ơn bạn đã đánh giá bài viết" });
  } catch (error) {
    fail(res, error);
  }
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const data = await blogService.createBlog(req.user.id, req.body);
    res.status(201).json({ success: true, data, message: "Đã tạo bài viết" });
  } catch (error) {
    fail(res, error);
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await blogService.updateBlog(String(req.params.id), req.body), message: "Đã cập nhật bài viết" });
  } catch (error) {
    fail(res, error);
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await blogService.deleteBlog(String(req.params.id));
    res.json({ success: true, message: "Đã xóa bài viết" });
  } catch (error) {
    fail(res, error, 404);
  }
};

export const uploadBlogImage = (req: Request, res: Response) => {
  const imageUrl = (req as Request & { imageUrl?: string }).imageUrl;
  if (!imageUrl) return res.status(400).json({ message: "Không thể tải ảnh lên" });
  res.json({ success: true, data: { imageUrl } });
};
