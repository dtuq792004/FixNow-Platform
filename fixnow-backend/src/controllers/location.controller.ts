import { Request, Response } from "express";
import * as locationService from "../services/location.service";

export const updateLocation = async (req: Request, res: Response) => {
	try {
		const providerId = req.user?.id;
		if (!providerId) return res.status(401).json({ message: "Unauthorized" });
		const { lat, lng, accuracy, heading, speed } = req.body;
		const location = await locationService.updateProviderLocation({
			providerId,
			lat,
			lng,
			accuracy,
			heading,
			speed,
		});
		return res.status(200).json(location);
	} catch (error: any) {
		return res.status(500).json({ message: error.message });
	}
};

export const getMyLocation = async (req: Request, res: Response) => {
	try {
		const providerId = req.user?.id;
		if (!providerId) return res.status(401).json({ message: "Unauthorized" });
		const location = await locationService.getProviderLocation(providerId);
		return res.status(200).json(location);
	} catch (error: any) {
		return res.status(500).json({ message: error.message });
	}
};
