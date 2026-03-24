import { Request, Response } from "express";
import * as providerService from "../services/provider.service";
import { searchProvidersService } from "../services/provider-search.service";
import { getProviderPublicProfile } from "../services/provider-public-profile.service";
import { getTopRatedProviders } from "../services/feedback.services";

export const getProvider = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const provider = await providerService.getProviderByUserId(userId as string);
    return res.json({ success: true, data: provider, message: "Provider retrieved successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProviderStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { activeStatus } = req.body;
    const provider = await providerService.updateProviderStatus(userId as string, activeStatus);
    return res.json({ success: true, data: provider, message: "Provider status updated" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWorkingArea = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { workingAreas } = req.body;
    const provider = await providerService.updateWorkingArea(userId as string, workingAreas);
    return res.json({ success: true, data: provider, message: "Working area updated" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const searchProviders = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    const providers = await searchProvidersService(keyword as string);
    return res.json({ success: true, data: providers, message: "Search success" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopRatedProvidersController = async (req: Request, res: Response) => {
  try {
    const providers = await getTopRatedProviders(4);
    return res.json({ success: true, data: providers, message: "Top rated providers success" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Public — accessible by authenticated customers. Works with Provider._id or User._id. */
export const getProviderPublicProfileController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await getProviderPublicProfile(id as string);
    return res.json({ success: true, data: profile });
  } catch (error: any) {
    const status = error.message === "Provider not found" ? 404 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};
