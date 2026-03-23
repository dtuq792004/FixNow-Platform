import { Request, Response } from "express";
import * as requestService from "../services/request.service";
//customer
export const createRequestController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const customerId = req.user.id;

    const { request, checkoutUrl } = await requestService.createRequest(customerId, req.body);

    return res.status(201).json({
      message: "Request created. Please pay to proceed.",
      data: request,
      checkoutUrl
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyRequestsController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const customerId = req.user.id;

    const requests = await requestService.getMyRequests(customerId);

    return res.json({ data: requests });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const cancelRequestController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const customerId = req.user.id;
    const  id  = req.params.id as string;

    const request = await requestService.cancelRequest(id, customerId);

    return res.json({
      message: "Request cancelled",
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
//provider
export const getAvailableRequestsController = async (req: Request, res: Response) => {
  try {
    const requests = await requestService.getAvailableRequests();

    return res.json({ data: requests });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const respondRequestController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const providerId = req.user._id;
    const  id  = req.params.id as string;
    const { action } = req.body;

    const request = await requestService.respondRequest(id, providerId, action);

    return res.json({
      message: `Request ${action.toLowerCase()}ed`,
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const startServiceController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const providerId = req.user._id;
    const id  = req.params.id as string;

    const request = await requestService.startService(id, providerId);

    return res.json({
      message: "Service started",
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const completeServiceController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const providerId = req.user._id;
    const id  = req.params.id as string;
    const { completionMedia, completionNote } = req.body;

    const request = await requestService.completeService(
      id,
      providerId,
      completionMedia,
      completionNote
    );

    return res.json({
      message: "Service completed successfully",
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};


