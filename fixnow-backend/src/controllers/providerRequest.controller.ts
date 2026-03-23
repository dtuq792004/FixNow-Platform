import { Response, Request } from "express";
import * as providerRequestService from "../services/providerRequest.service";

/**
 * Customer create provider request
 */
export const createProviderRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;

    const request = await providerRequestService.createProviderRequest(
      userId as string,
      req.body
    );

    return res.json({
      success: true,
      data: request,
      message: "Provider request submitted",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin get provider requests
 */
export const getProviderRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const { status } = req.query;

    const requests = await providerRequestService.getProviderRequests(
      status as string
    );

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin approve provider request
 */
export const approveProviderRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const adminId = (req as any).user?.id;
    const { id } = req.params;

    const result = await providerRequestService.approveProviderRequest(
      id as string,
      adminId as string
    );

    return res.json({
      success: true,
      data: result,
      message: "Provider request approved",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Customer get their provider request
 */
export const getMyProviderRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;

    const request = await providerRequestService.getMyProviderRequest(
      userId as string
    );

    return res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin reject provider request
 */
export const rejectProviderRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const adminId = (req as any).user?.id;
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const result = await providerRequestService.rejectProviderRequest(
      id as string,
      adminId as string,
      rejectionReason
    );

    return res.json({
      success: true,
      data: result,
      message: "Provider request rejected",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};