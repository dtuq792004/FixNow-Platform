import { Request, Response } from "express";
import * as adminService from "../services/admin.service";

const numberQuery = (value: unknown, fallback: number) => Number(value) || fallback;
const sendError = (res: Response, error: any) =>
  res.status(error?.message === "Email đã tồn tại" ? 409 : 500).json({ success: false, message: error?.message ?? "Server error" });

export const getDashboard = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getDashboard() }); } catch (error) { sendError(res, error); }
};
export const getCategories = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getCategories() }); } catch (error) { sendError(res, error); }
};
export const getServices = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getServices({ ...req.query, page: numberQuery(req.query.page, 1), limit: numberQuery(req.query.limit, 9) } as any) }); } catch (error) { sendError(res, error); }
};
export const getRequests = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getRequests({ ...req.query, page: numberQuery(req.query.page, 1), limit: numberQuery(req.query.limit, 10) } as any) }); } catch (error) { sendError(res, error); }
};
export const getPayments = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getPayments({ ...req.query, page: numberQuery(req.query.page, 1), limit: numberQuery(req.query.limit, 10) } as any) }); } catch (error) { sendError(res, error); }
};
export const getFeedbacks = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getFeedbacks({ ...req.query, page: numberQuery(req.query.page, 1), limit: numberQuery(req.query.limit, 10) } as any) }); } catch (error) { sendError(res, error); }
};
export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.updateFeedbackStatus(req.params.id as string, req.body.status) }); } catch (error) { sendError(res, error); }
};
export const getComplaints = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getComplaints({ ...req.query, page: numberQuery(req.query.page, 1), limit: numberQuery(req.query.limit, 10) } as any) }); } catch (error) { sendError(res, error); }
};
export const updateComplaintStatus = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.updateComplaintStatus(req.params.id as string, req.body.status, req.user!.id) }); } catch (error) { sendError(res, error); }
};
export const getAnalytics = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getAnalytics() }); } catch (error) { sendError(res, error); }
};
export const getBlogViewReport = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getBlogViewReport(numberQuery(req.query.weekOffset, 0)) }); } catch (error) { sendError(res, error); }
};
export const getRevenueReport = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getRevenueReport(numberQuery(req.query.weekOffset, 0)) }); } catch (error) { sendError(res, error); }
};
export const getCatalogReport = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getCatalogReport() }); } catch (error) { sendError(res, error); }
};
export const getSettings = async (_req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.getSettings() }); } catch (error) { sendError(res, error); }
};
export const updateSettings = async (req: Request, res: Response) => {
  try { res.json({ success: true, data: await adminService.updateSettings(req.user!.id, req.body) }); } catch (error) { sendError(res, error); }
};
export const createAdmin = async (req: Request, res: Response) => {
  try { res.status(201).json({ success: true, data: await adminService.createAdmin(req.body) }); } catch (error) { sendError(res, error); }
};
