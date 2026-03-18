import { Request, Response } from "express";
import * as serviceService from "../services/service.service";

export const createServiceController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const providerId = req.user.id;

    const service = await serviceService.createService(providerId, req.body);

    return res.status(201).json({
      message: "Service created successfully, waiting for approval",
      data: service,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL APPROVED SERVICES (cho customer)
export const getServicesController = async (req: Request, res: Response) => {
  try {
    const services = await serviceService.getServices(req.query);

    return res.json({
      data: services,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// GET BY CATEGORY
export const getServicesByCategoryController = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || Array.isArray(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const services = await serviceService.getServicesByCategory(categoryId);

    return res.json({
      data: services,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};


// UPDATE (provider only)
export const updateServiceController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const providerId = req.user._id;
    const { id } = req.params;

    const service = await serviceService.updateService(
      id,
      providerId,
      req.body
    );

    return res.json({
      message: "Service updated successfully",
      data: service,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};


// DELETE (provider only)
export const deleteServiceController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const providerId = req.user._id;
    const { id } = req.params;

    await serviceService.deleteService(id, providerId);

    return res.json({
      message: "Service deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};


// APPROVE (admin)
export const approveServiceController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const service = await serviceService.approveService(id);

    return res.json({
      message: "Service approved",
      data: service,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};


// REJECT (admin)
export const rejectServiceController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const service = await serviceService.rejectService(id);

    return res.json({
      message: "Service rejected",
      data: service,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};