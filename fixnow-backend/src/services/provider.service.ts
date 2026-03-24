/** Core provider CRUD — search is in provider-search.service.ts, public profile in provider-public-profile.service.ts */
import { Provider } from "../models/provider.model";

export const getProviderByUserId = async (userId: string) => {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new Error("Provider not found");
  return provider;
};

export const updateProviderStatus = async (
  userId: string,
  activeStatus: "ONLINE" | "OFFLINE"
) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    { activeStatus },
    { new: true }
  );
  if (!provider) throw new Error("Provider not found");
  return provider;
};

export const updateWorkingArea = async (userId: string, workingAreas: string[]) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    { workingAreas },
    { new: true }
  );
  if (!provider) throw new Error("Provider not found");
  return provider;
};
