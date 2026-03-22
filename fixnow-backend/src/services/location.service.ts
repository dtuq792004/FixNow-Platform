import Request from "../models/request.model";
import { Location } from "../models/location.model";

export interface UpdateLocationInput {
  providerId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export const updateProviderLocation = async ({
  providerId,
  lat,
  lng,
  accuracy,
  heading,
  speed,
}: UpdateLocationInput) => {
  const location = await Location.findOneAndUpdate(
    { providerId },
    {
      providerId,
      lat,
      lng,
      accuracy,
      heading,
      speed,
      isOnline: true,
      lastSeenAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return location;
};

export const markProviderOffline = async (providerId: string) => {
  return Location.findOneAndUpdate(
    { providerId },
    {
      isOnline: false,
      lastSeenAt: new Date(),
    },
    { new: true },
  );
};

export const getProviderLocation = async (providerId: string) => {
  return Location.findOne({ providerId });
};

export const canJoinRequestLocationRoom = async (
  requestId: string,
  userId: string,
) => {
  const request = await Request.findById(requestId).select(
    "customerId providerId",
  );

  if (!request) {
    return {
      allowed: false,
      request: null,
      reason: "Request not found",
    };
  }

  const customerId = request.customerId?.toString();
  const providerId = request.providerId?.toString();
  const isAllowed = userId === customerId || userId === providerId;

  return {
    allowed: isAllowed,
    request,
    reason: isAllowed ? "OK" : "Forbidden",
  };
};
